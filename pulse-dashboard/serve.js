const express = require('express')
const graphqlHTTP = require('express-graphql')
const queries = require('./queries')

const app = express()

const schema = require('./schema')

app.use('/pulse4', graphqlHTTP({
    schema,
    graphiql: true,
    context: {
        statusQuery: queries.statusQuery,
        clientsQuery: queries.clientsQuery,
        clientLoader: queries.clientLoader,
        addToCartLoader: queries.addToCartLoader
    }
}))

app.listen(4000)

console.log('listening...')