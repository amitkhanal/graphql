const promise = require('bluebird')
const pgMonitor = require('pg-monitor')

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

const statusQueryTemplate = 'select * from atomic.manifest where to_char(commit_tstamp,\'yyyy-mm-dd\') >= ${startDate}'
const clientsQueryTemplate = 'select app_id, count(1) as pageViews from atomic.events where derived_tstamp between ${startDate} and ${endDate} group by 1'
const clientDataQueryTemplate='select platform, tr_country, dvce_type, br_name, geo_region_name, count(1) from atomic.events '+ 
                               'where app_id = ${app_id} and derived_tstamp between ${startDate} and ${endDate} group by 1,2,3,4,5'
const addToCartQueryTemplate='select count(1) as total, e.platform, a.sku, a.name, a.category, a.unit_price from' +
'atomic.com_snowplowanalytics_snowplow_add_to_cart_1 a, atomic.events e where e.app_id like ${app_id} and a.root_tstamp' +
'between ${startDate} and ${endDate} and e.event_id=a.root_id group by 2,3,4,5,6 order by total desc'

//const pgp = require('pg-promise')(pgPromiseOptions)
const pgp = require('pg-promise')(options)
const cn = {
    host: process.env.db_host,
    port: process.env.db_port,
    database: process.env.db,
    user: process.env.db_user,
    password: process.env.db_password
}


const db = pgp(cn)


//pgMonitor.attach(pgPromiseOptions, ['query', 'error']);

//const values

/* db.query('select platform, tr_country, dvce_type, br_name, geo_region_name, count(1) from atomic.events where derived_tstamp > \'2018-01-20\' group by 1,2,3,4,5')
.then(response => JSON.parse(JSON.stringify(response)) )
.then(data => {
    console.log(
     data
     .filter((elem, index, array) => {
        return elem.br_name == 'Chrome'
     }).map((elem) => {
        console.log(elem.count)
        return elem.count
     }).reduce( (total, elem ) => {
        return total = +total + +elem
        //console.log(total)
     })
)}) */

/* db.query('select platform, tr_country, dvce_type, br_name, geo_region_name, count(1) from atomic.events where derived_tstamp > \'2018-01-20\' group by 1,2,3,4,5')
.then(response => JSON.parse(JSON.stringify(response)) )
.then(data => {
    let statMap = new Map()
    statMap.set('country',[])
    statMap.set('device',[])
    statMap.set('browser',[])
    statMap.set('geoRegion',[])

    data.forEach(function (value){
        statMap.get('country').push(value.tr_country)
        statMap.get('device').push(value.dvce_type)
        statMap.get('browser').push(value.br_name)
        statMap.get('browser').push(value.geo_region_name)
    })
    //console.log(statMap)
    return statMap
}) */

module.exports = {
    statusQuery: startDate => {
        let values = {'startDate': startDate}
        return  db.query(statusQueryTemplate, values )
                .then(response => JSON.parse(JSON.stringify(response)))
        //.finally(db.$pool.end)
    },

    clients1Query: (startDate, endDate) => {
        let values = {'startDate': startDate, 'endDate': endDate}
        return db.query(clientsQueryTemplate, values)
               .then(response => JSON.parse(JSON.stringify(response)))
    },

    clientQuery: (app_id, startDate, endDate) => {
        let values = {'app_id' : app_id, 'startDate': startDate, 'endDate': endDate}
        return db.query(clientDataQueryTemplate, values)
                .then(response => JSON.parse(JSON.stringify(response)))
    },

    addToCartQuery: (app_id, startDate, endDate) => {
        let values = {'app_id' : app_id, 'startDate': startDate, 'endDate': endDate}
        return db.query(addToCartQueryTemplate, values)
                .then(response => JSON.parse(JSON.stringify(response)))
    }
}
