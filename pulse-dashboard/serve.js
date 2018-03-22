const express = require('express')
const graphqlHTTP = require('express-graphql')
const queries = require('./queries')
var cors = require('cors');

const app = express()

const schema = require('./schema')

app.use('/pulse', graphqlHTTP({
    schema,
    graphiql: true,
    context: {
        statusLoader: queries.statusLoader,
        clientsLoader: queries.clientsLoader,
        clientLoader: queries.clientLoader,
        addToCartLoader: queries.addToCartLoader,
        searchLoader: queries.searchLoader,
        newClientQuery: queries.newClientQuery,
        clientTransactionLoader: queries.clientTransactionLoader
    }
}))
app.use(cors())

app.listen(4000)

console.log('listening...')