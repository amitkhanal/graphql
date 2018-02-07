const queries = require('./queries')
const utils = require('./utils')

const {
    GraphQLInt,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} = require('graphql')

const ClientSummary = new GraphQLObjectType({
    name: 'ClientSummary',
    description: '...',

    fields: () => ({
        app_id: {
            type: GraphQLString,
            resolve: data => data.app_id
        },
        pageViews: {
            type: GraphQLInt,
            resolve: data => data.pageviews
        }
    })
})

const ClientType = new GraphQLObjectType({
    name: 'ClientType',
    description: '...',

    fields: () => ({
        countryStat: {
            type: new GraphQLList(CountryStatType),
            args: {
                name: {
                    type: GraphQLString
                },
                threshold: {
                    type: GraphQLInt
                }
            },
            resolve: (data, args) => {
                let statMap = utils.getFilterdMap(data, 'tr_country', args.name)
                return utils.mapToArray(statMap, args.threshold)
            }
        },
        deviceStat: {
            type: new GraphQLList(DeviceStatType),
            args: {
                name: {
                    type: GraphQLString
                },
                threshold: {
                    type: GraphQLInt
                }
            },
            resolve: (data, args) => {
                let statMap = utils.getFilterdMap(data, 'dvce_type', args.name)
                return utils.mapToArray(statMap, args.threshold)
            }
        },
        browserStat: {
            type: new GraphQLList(BrowserStatType),
            args: {
                name: {
                    type: GraphQLString
                },
                threshold: {
                    type: GraphQLInt
                }
            },
            resolve: (data, args) => {
                let statMap = utils.getFilterdMap(data, 'br_name', args.name)
                return utils.mapToArray(statMap, args.threshold)
            }
        },
        regionStat: {
            type: new GraphQLList(RegionStatType),
            args: {
                name: {
                    type: GraphQLString
                },
                threshold: {
                    type: GraphQLInt
                }
            },
            resolve: (data, args) => {
                let statMap = utils.getFilterdMap(data, 'geo_region_name', args.name)
                return utils.mapToArray(statMap, args.threshold)
            }
        },
        addToCartStat: {
            type: AddToCartStatType,
            resolve: data => console.log(JSON.stringify(data))
        },
        searchStat: {
            type: SearchStatType,
            args: {
                app_id: {
                    type: GraphQLString
                }
            },
            resolve: () => console.log
        },
        topSearchKeywordsStat: {
            type: TopSearchKeywordsStatType,
            args: {
                app_id: {
                    type: GraphQLString
                }
            },
            resolve: () => console.log
        }
    })
})

const CountryStatType = new GraphQLObjectType({
    name: 'CountryStatType',
    description: '...',

    fields: () => ({
        country: {
            type: GraphQLString,
            resolve: data => data.substring(0, data.indexOf('==>'))
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.substring((data.indexOf('==>') + 3), data.length)
        }
    })
})

const DeviceStatType = new GraphQLObjectType({
    name: 'DeviceStatType',
    description: '...',

    fields: () => ({
        device: {
            type: GraphQLString,
            resolve: data => data.substring(0, data.indexOf('==>'))
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.substring((data.indexOf('==>') + 3), data.length)
        }
    })
})

const BrowserStatType = new GraphQLObjectType({
    name: 'BrowserStatType',
    description: '...',

    fields: () => ({
        browser: {
            type: GraphQLString,
            resolve: data => data.substring(0, data.indexOf('==>'))
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.substring((data.indexOf('==>') + 3), data.length)
        }
    })
})

const RegionStatType = new GraphQLObjectType({
    name: 'RegionStatType',
    description: '...',

    fields: () => ({
        region: {
            type: GraphQLString,
            resolve: data => data.substring(0, data.indexOf('==>'))
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.substring((data.indexOf('==>') + 3), data.length)
        }
    })
})

const AddToCartStatType = new GraphQLObjectType({
    name: 'AddToCartStatType',
    description: '...',

    fields: () => ({
        channels: {
            type: new GraphQLList(AddToCartChannelType),
            resolve: data => console.log('dd- ' + data)
        },
        topSkus: {
            type: GraphQLList(TopSkusStatType),
            resolve: data => console.log
        }
    })
})

const AddToCartChannelType = new GraphQLObjectType({
    name: 'AddToCartChannelType',
    description: '...',

    fields: () => ({
        platform: {
            type: GraphQLString,
            resolve: () => console.log
        },
        count: {
            type: GraphQLInt,
            resolve: () => console.log
        }
    })
})

const TopSkusStatType = new GraphQLObjectType({
    name: 'TopSkusStatType',
    description: '...',

    fields: () => ({
        sku: {
            type: GraphQLString,
            resolve: data => console.log
        },
        count: {
            type: GraphQLInt,
            resolve: data => console.log
        },
        name: {
            type: GraphQLString,
            resolve: data => console.log
        },
        category: {
            type: GraphQLString,
            resolve: data => console.log
        },
        unitPrice: {
            type: GraphQLString,
            resolve: data => console.log
        }
    })
})

const SearchStatType = new GraphQLObjectType({
    name: 'SearchStatType',
    description: '...',

    fields: () => ({
        channel: {
            type: GraphQLString,
            resolve: () => console.log
        },
        count: {
            type: GraphQLInt,
            resolve: () => console.log
        }
    })
})

const TopSearchKeywordsStatType = new GraphQLObjectType({
    name: 'TopSearchKeywordsStatType',
    description: '...',

    fields: () => ({
        keyword: {
            type: GraphQLString,
            resolve: () => console.log
        },
        count: {
            type: GraphQLInt,
            resolve: () => console.log
        }
    })
})

const StatusType = new GraphQLObjectType({
    name: 'Status',
    description: '...',

    fields: () => ({
        etl_tstamp: {
            type: GraphQLString,
            resolve: data => data.etl_tstamp
        },
        commit_tstamp: {
            type: GraphQLString,
            resolve: data => data.commit_tstamp
        },
        event_count: {
            type: GraphQLString,
            resolve: data => data.event_count
        },
        shredded_cardinality: {
            type: GraphQLInt,
            resolve: data => data.shredded_cardinality
        }

    })
})

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: 'Pulse Dashboard',

        fields: () => ({
            clients: {
                type: new GraphQLList(ClientSummary),
                args: {
                    startDate: {
                        type: GraphQLString
                    },
                    endDate: {
                        type: GraphQLString
                    }
                },
                resolve: (root, args) => queries.clientsQuery(args.startDate, args.endDate)
            },
            client: {
                type: ClientType,
                args: {
                    app_id: {
                        type: GraphQLString
                    },
                    startDate: {
                        type: GraphQLString
                    },
                    endDate: {
                        type: GraphQLString
                    }
                },
                resolve: (root, args) => queries.clientQuery(args.app_id, args.startDate, args.endDate)
            },
            status: {
                type: new GraphQLList(StatusType),
                args: {
                    startDate: {
                        type: GraphQLString
                    }
                },
                resolve: (root, args) => queries.statusQuery(args.startDate)
            },
        })
    })
})