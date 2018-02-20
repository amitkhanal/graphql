const promise = require('bluebird')
const pgMonitor = require('pg-monitor')
const DataLoader = require('dataloader')
const utils = require('./utils')

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
    clientDataQueryTemplate : 'select app_id, platform, tr_country, dvce_type, br_name, geo_region_name, count(1) from atomic.events ' +
    'where app_id = ANY ($1) and derived_tstamp between ($2) and ($3) group by 1,2,3,4,5,6',
    statusQueryTemplate : 'select * from atomic.manifest where to_char(commit_tstamp,\'yyyy-mm-dd\') >= ($1)',
    clientsQueryTemplate : 'select app_id, count(1) as pageViews from atomic.events where derived_tstamp between {$1} and {$2} group by 1',
    addToCartQueryTemplate : 'select count(1) as total, e.platform, a.sku, a.name, a.category, a.unit_price from' +
    ' atomic.com_snowplowanalytics_snowplow_add_to_cart_1 a, atomic.events e where e.app_id = ANY ($1) and a.root_tstamp' +
    ' between ($2) and ($3) and e.event_id=a.root_id group by 2,3,4,5,6 order by total desc',
    searchQueryTemplate : 'select e.platform, s.terms, s.total_results, count(1) as total from atomic.events e, com_snowplowanalytics_snowplow_site_search_1 s '+
    'where e.event_id = s.root_id and e.app_id = ($1) and e.derived_tstamp between ($2) and ($3) group by 1,2,3'
}   

const pgp = require('pg-promise')(pgPromiseOptions)
//const pgp = require('pg-promise')(options)
const cn = {
    host: process.env.db_host,
    port: process.env.db_port,
    database: process.env.db,
    user: process.env.db_user,
    password: process.env.db_password
}

const db = pgp(cn)


//pgMonitor.attach(pgPromiseOptions, ['query', 'error']);

const statusQuery = startDate => db.query(queryTemplates.statusQueryTemplate, [startDate]).then(response => response)
const statusLoader = new DataLoader(keys => Promise.all(keys.map(queryParam => statusQuery(queryParam[0]).then(response => response))))

/* const clientsQuery = (startDate, endDate) => db.task('my-task', t => {
    return t.any(queryTemplates.clientsQueryTemplate, [startDate, endDate])
    .then(response => {
        let app_ids = response.map(elem => elem.app_id).filter((element, index, array) => index == array.indexOf(element))
        //return [clientsResponse[0],
        return [response, 
            t.any(queryTemplates.clientDataQueryTemplate, [app_ids, startDate, endDate])
                .then(data => data)
                .catch(error => console.log(error))
            ]
})})
 */    
const clientsQuery = (startDate, endDate) => db.query(queryTemplates.clientsQueryTemplate, [startDate, endDate])
    .then(response => {
        let app_ids = response.map(elem => elem.app_id)
            .filter((element, index, array) => index == array.indexOf(element))
        return db.query(queryTemplates.clientDataQueryTemplate, [app_ids, startDate, endDate])
            .then(data => response.map( (elem, index) => {
                elem.stat = data
                elem.startDate = startDate
                elem.endDate = endDate
                return elem
            }))
            .catch(error => console.log(error))
    })

const clientsLoader = new DataLoader(keys => Promise.all(keys.map(queryParam => clientsQuery(queryParam[0], queryParam[1]).then(response => response))))

const clientQuery = (app_id, startDate, endDate) => db.query(queryTemplates.clientDataQueryTemplate, [app_id, startDate, endDate]).then(response => response)
const clientLoader = new DataLoader(keys =>  Promise.all(queryParam => clientQuery(queryParam[0], queryParam[1], queryParam[2])))

const addToCartQuery = (app_ids, startDate, endDate) => db.query(queryTemplates.addToCartQueryTemplate, [app_ids, startDate, endDate])
    .then(response => response)
const addToCartLoader = new DataLoader(keys => Promise.all(keys.map(queryParam => addToCartQuery(queryParam[0], queryParam[1], queryParam[2]))))

const searchQuery = (app_id, startDate, endDate) => db.query(queryTemplates.searchQueryTemplate, [app_id, startDate, endDate])
    .then(response => response)
const searchLoader = new DataLoader(keys => Promise.all(keys.map(queryParam => searchQuery(queryParam[0], queryParam[1], queryParam[2]
))))

module.exports = {
    addToCartLoader,
    statusLoader,
    clientsLoader,
    clientLoader,
    searchLoader
}