const promise = require('bluebird')
const pgMonitor = require('pg-monitor')
const DataLoader = require('dataloader')
const utils = require('./utils')
require('log-timestamp');
const NodeCache = require("node-cache");
const cache = new NodeCache();

const options = {
    // Initialization Options
    promiseLib: promise
}

const pgPromiseOptions = {
    query: (e) => {
        console.log('QUERY: ', e.query);
        if (e.params) {
            console.log('PARAMS:', e.params);
        }
    }
}

const queryTemplates = {
    clientDataQueryTemplate: 'select app_id, platform, tr_country, dvce_type, br_family, geo_region_name, count(1) from atomic.events ' +
        'where app_id = ANY ($1) and derived_tstamp between ($2) and ($3) group by 1,2,3,4,5,6',
    statusQueryTemplate: 'select * from atomic.manifest where to_char(commit_tstamp,\'yyyy-mm-dd\') >= ($1)',
    allClientsQueryTemplate: 'select app_id, count(1) as pageViews from atomic.events where derived_tstamp between ($1) and ($2) group by 1',
    filteredClientsQueryTemplate: 'select app_id, count(1) as pageViews from atomic.events where derived_tstamp between ($1) and ($2) and app_id = ANY ($3) group by 1',
    addToCartQueryTemplate: 'select count(1) as total, e.platform, a.sku, a.name, a.category, a.unit_price from' +
        ' atomic.com_snowplowanalytics_snowplow_add_to_cart_1 a, atomic.events e where e.app_id = ANY ($1) and a.root_tstamp' +
        ' between ($2) and ($3) and e.event_id=a.root_id group by 2,3,4,5,6 order by total desc',
    searchQueryTemplate: 'select e.platform, s.terms, s.total_results, count(1) as total from atomic.events e, com_snowplowanalytics_snowplow_site_search_1 s ' +
        'where e.event_id = s.root_id and e.app_id = ANY ($1) and e.derived_tstamp between ($2) and ($3) group by 1,2,3',
    newClientQueryTemplate: 'insert into public.kyc_oeclient_dim(oe_client_id, oe_client_name, oe_client_short_name, oe_client_city, oe_client_state,' +
        'oe_client_postal_code, oe_client_country, client_email) ' +
        'values(${id},${name},${shortName},${city},${state},${postalCode},${country},${email}) RETURNING oe_client_id, oe_client_short_name',
    clientTransactionQueryTemplate: 'select tr_country, dvce_type, count(1), sum(tr_total) as total from atomic.events where app_id= ANY ($1) and derived_tstamp between '+
    '($2) and ($3) and event=\'transaction\' group by tr_country, dvce_type'
}

const pgp = require('pg-promise')(pgPromiseOptions)
//const pgp = require('pg-promise')(options)
const pulseConfiguration = {
    host: process.env.db_host,
    port: process.env.db_port,
    database: process.env.db,
    user: process.env.db_user,
    password: process.env.db_password
}

const cacheTimeout = 10000

const pulseDB = pgp(pulseConfiguration)

/* const kycConfiguration = {
    host: process.env.kycdb_host,
    port: process.env.kycdb_port,
    database: process.env.kycdb,
    user: process.env.kycdb_user,
    password: process.env.kycdb_password
}
 */

const kConfiguration = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'password'
}

const kDB = pgp(kConfiguration)


//pgMonitor.attach(pgPromiseOptions, ['query', 'error']);

const newClientQuery = queryObject =>
    kDB.tx(t => t.batch([kDB.one(queryTemplates.newClientQueryTemplate, queryObject)])).then(response => response)
    .catch(error => error);

const statusQuery = startDate => {
    let cacheKey = 'status-' + startDate
    let cachedValue = cache.get(cacheKey)
    if (cachedValue != undefined) {
        console.log("Found cache for " + cacheKey)
        return cachedValue
    }
    return pulseDB.query(queryTemplates.statusQueryTemplate, [startDate]).then(response => {
        let cacheLoaded = cache.set(cacheKey, response, cacheTimeout)
        console.log("Cache loaded - " + cacheLoaded + " key - " + cacheKey)
        return response
    })
}

const statusLoader = new DataLoader(keys => Promise.all(keys.map(queryParam => statusQuery(queryParam[0])))) //.then(response => response))))

const clientTransactionQuery = (app_ids, startDate, endDate) => {
    let cacheKey = 'clientTransaction-' + app_ids.join() + '-'+startDate+'-'+endDate
    let cachedValue = cache.get(cacheKey)
    if (cachedValue != undefined) {
        console.log("Found cache for " + cacheKey)
        return cachedValue
    }
    return pulseDB.query(queryTemplates.clientTransactionQueryTemplate, [app_ids, startDate, endDate]).then(response => {
        let cacheLoaded = cache.set(cacheKey, response, cacheTimeout)
        console.log("Cache loaded - " + cacheLoaded + " key - " + cacheKey)
        return response
    })
}

const clientTransactionLoader = new DataLoader(keys => Promise.all(keys.map(queryParam => clientTransactionQuery(queryParam[0], queryParam[1], queryParam[2]))))

const getClientsQuery = app_ids => {
    if (app_ids) {
        return queryTemplates.filteredClientsQueryTemplate
    } else {
        return queryTemplates.allClientsQueryTemplate
    }
}

const clientsQuery = (startDate, endDate, app_ids) => {
    let clientCacheKey = 'clientData-' + (app_ids ? app_ids.join() : '') + '-' + startDate + '-' + endDate
    let clientCachedValue = cache.get(clientCacheKey)
    if (clientCachedValue != undefined) {
        console.log("Found cache for " + clientCacheKey)
        return clientCachedValue
    }
    return pulseDB.query(
            getClientsQuery(app_ids), [startDate, endDate, app_ids])
        .then(response => {
            let app_ids = response.map(elem => elem.app_id != null ? elem.app_id : '')
                .filter((element, index, array) => index == array.indexOf(element))



            return pulseDB.query(queryTemplates.clientDataQueryTemplate, [app_ids, startDate, endDate])
                .then(data => {
                    let clientData = response.map((elem, index) => {
                        //elem.app_ids = app_ids
                        elem.stat = data
                        elem.startDate = startDate
                        elem.endDate = endDate
                        return elem
                    })
                    let cacheLoaded = cache.set(clientCacheKey, clientData, cacheTimeout)
                    console.log("Cache loaded - " + cacheLoaded + " key - " + clientCacheKey)
                    return clientData
                }).catch(error => console.log(error))
        })
}

const clientsLoader = new DataLoader(keys => Promise.all(keys.map(queryParam => clientsQuery(queryParam[0], queryParam[1], queryParam[2])))) //.then(response => response))))

const clientQuery = (app_id, startDate, endDate) => pulseDB.query(queryTemplates.clientDataQueryTemplate, [app_id, startDate, endDate]).then(response => response)
const clientLoader = new DataLoader(keys => Promise.all(queryParam => clientQuery(queryParam[0], queryParam[1], queryParam[2])))

const addToCartQuery = (app_ids, startDate, endDate) => {
    let cacheKey = 'addToCart-' + app_ids.join() + '-' + startDate + '-' + endDate
    let cachedValue = cache.get(cacheKey)
    if (cachedValue != undefined) {
        console.log("Found cache for " + cacheKey)
        return cachedValue
    }
    return pulseDB.query(queryTemplates.addToCartQueryTemplate, [app_ids, startDate, endDate])
        .then(response => {
            let cacheLoaded = cache.set(cacheKey, response, cacheTimeout)
            console.log("Cache loaded - " + cacheLoaded + " key - " + cacheKey)
            return response
        })
}

const addToCartLoader = new DataLoader(keys => Promise.all(keys.map(queryParam => addToCartQuery(queryParam[0], queryParam[1], queryParam[2]))))

const searchQuery = (app_ids, startDate, endDate) => {
    let cacheKey = 'search-' + app_ids.join() + '-' + startDate + '-' + endDate
    let cachedValue = cache.get(cacheKey)
    if (cachedValue != undefined) {
        console.log("Found cache for " + cacheKey)
        return cachedValue
    }
    return pulseDB.query(queryTemplates.searchQueryTemplate, [app_ids, startDate, endDate])
        .then(response => {
            let cacheLoaded = cache.set(cacheKey, response, cacheTimeout)
            console.log("Cache loaded - " + cacheLoaded + " key - " + cacheKey)
            return response
        })
}

const searchLoader = new DataLoader(keys => Promise.all(keys.map(queryParam => searchQuery(queryParam[0], queryParam[1], queryParam[2]))))

module.exports = {
    addToCartLoader,
    statusLoader,
    clientsLoader,
    clientLoader,
    searchLoader,
    newClientQuery,
    clientTransactionLoader
}