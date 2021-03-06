const utils = require('./utils')
const countryNames = require('countrynames')
const ld = require('lodash')

const {
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInputObjectType
} = require('graphql')

const ClientMutationType = new GraphQLObjectType({
    name: 'ClientMutationType',
    description: '...',

    fields: () => ({
        addClient: {
            type: KYCClientType,
            description: 'Create new KYC Client',
            args: {
                client: {
                    type: KYCClientInputType
                }
            },
            resolve: (data, args, context) => context.newClientQuery(args.client)
        }
    })
})

const KYCClientType = new GraphQLObjectType({
    name: 'KYCClientType',
    description: '...',

    fields: () => ({
        client_id: {
            type: GraphQLString,
            resolve: data => {
                return data[0].oe_client_id
            }
        },
        test: {
            type: GraphQLString,
            resolve: data => data[0].oe_client_short_name
        }
    })
})

const KYCClientInputType = new GraphQLInputObjectType({
    name: 'KYCClientInput',
    description: '...',

    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString)
        },
        name: {
            type: new GraphQLNonNull(GraphQLString)
        },
        shortName: {
            type: new GraphQLNonNull(GraphQLString)
        },
        city: {
            type: new GraphQLNonNull(GraphQLString)
        },
        state: {
            type: new GraphQLNonNull(GraphQLString)
        },
        postalCode: {
            type: new GraphQLNonNull(GraphQLString)
        },
        country: {
            type: new GraphQLNonNull(GraphQLString)
        },
        email: {
            type: new GraphQLNonNull(GraphQLString)
        }
    })
})

const ClientType = new GraphQLObjectType({
    name: 'ClientType',
    description: '...',

    fields: () => ({
        app_id: {
            type: GraphQLString,
            resolve: data => data.app_id
        },
        pageViews: {
            type: GraphQLInt,
            resolve: data => data.pageviews
        },
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
            resolve: (data, args, context) => {
                //TODO make name and threshold to be handled via same function
                let countryMap = utils.getFilterdMap(data.stat, data.app_id, 'geo_country', args.name)
                return utils.mapToArray(countryMap, args.threshold)
                       .sort((elem1, elem2) => elem2.value.count - elem1.value.count)
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
                let statMap = utils.getFilterdMap(data.stat, data.app_id, 'dvce_type', args.name)
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
                let statMap = utils.getFilterdMap(data.stat, data.app_id, 'br_family', args.name)
                return utils.mapToArray(statMap, args.threshold)

            }
        },
        addToCartStat: {
            type: AddToCartStatType,
            resolve: (data, args, context) => context.addToCartLoader.load([
                [data.app_id], data.startDate, data.endDate
            ])
        },
        searchStat: {
            type: SearchStatType,
            args: {
                app_id: {
                    type: GraphQLString
                }
            },
            resolve: (data, args, context) => context.searchLoader.load([
                [data.app_id], data.startDate, data.endDate
            ])
        },
        transactionStat: {
            type: new GraphQLList(TransactionStatType),
            resolve: (data, args, context) => context.clientTransactionLoader.load([
                [data.app_id], data.startDate, data.endDate
            ])

        }
    })
})

const CountryStatType = new GraphQLObjectType({
    name: 'CountryStatType',
    description: '...',

    fields: () => ({
        country: {
            type: GraphQLString,
            resolve: data => {
                if (typeof data.key==undefined || data.key == null){
                    return 'undefined'
                }
                let name = countryNames.getName(data.key)
                if (typeof name==undefined || name == null){
                    return 'undefined'
                }
                return countryNames.getName(data.key)
                .toLowerCase()
                .split(' ')
                .map(word => word[0].toUpperCase() + word.substr(1))
                .join(' ')
            }
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.value.count
        },
        regions: {
            type: new GraphQLList(RegionStatType),
            args: {
                name: {
                    type: GraphQLString
                },
                threshold: {
                    type: GraphQLInt
                }
            },
            resolve: data => utils.mapToArray(data.value.regions)
                             .sort((elem1, elem2) => elem2.value - elem1.value)
        }
    })
})

const DeviceStatType = new GraphQLObjectType({
    name: 'DeviceStatType',
    description: '...',

    fields: () => ({
        device: {
            type: GraphQLString,
            resolve: data => data.key
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.value.count
        }
    })
})

const BrowserStatType = new GraphQLObjectType({
    name: 'BrowserStatType',
    description: '...',

    fields: () => ({
        browser: {
            type: GraphQLString,
            resolve: data => data.key
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.value.count
        }
    })
})

const RegionStatType = new GraphQLObjectType({
    name: 'RegionStatType',
    description: '...',

    fields: () => ({
        region: {
            type: GraphQLString,
            resolve: data => data.key
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.value
        }
    })
})

const AddToCartStatType = new GraphQLObjectType({
    name: 'AddToCartStatType',
    description: '...',

    fields: () => ({
        channels: {
            type: new GraphQLList(AddToCartChannelType),
            resolve: data => {
                let channelMap = new Map
                data.forEach(element => {
                    if (channelMap.has(element.dvce_type)) {
                        channelMap.set(element.dvce_type, +channelMap.get(element.dvce_type) + +element.total)
                    } else {
                        channelMap.set(element.dvce_type, +element.total)
                    }
                })
                return utils.mapToArray(channelMap)
            }
        },
        topSkus: {
            type: new GraphQLList(TopSkusStatType),
            args: {
                count: {
                    type: GraphQLInt
                }
            },
            resolve: (data, args) => {
                let channelMap = new Map
                data.forEach(element => {
                    if (channelMap.has(element.sku)) {
                        let total = 0
                        if (channelMap.get(element.sku).count != undefined) {
                            total = +channelMap.get(element.sku).count
                        }
                        channelMap.set(element.sku.count, total + +element.total)
                    } else {
                        channelMap.set(element.sku, {
                            name: element.name,
                            category: element.category,
                            price: element.unit_price,
                            count: +element.total
                        })
                    }
                })
                let totalItemsToReturn = channelMap.size
                if (args && args.count) {
                    totalItemsToReturn = args.count
                }
                return utils.mapToArray(channelMap)
                    .sort((elem1, elem2) => elem2.value.count - elem1.value.count)
                    .slice(0, args.count)
            }
        }
    })
})

const AddToCartChannelType = new GraphQLObjectType({
    name: 'AddToCartChannelType',
    description: '...',

    fields: () => ({
        device: {
            type: GraphQLString,
            resolve: data => data.key
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.value
        }
    })
})

const TopSkusStatType = new GraphQLObjectType({
    name: 'TopSkusStatType',
    description: '...',

    fields: () => ({
        sku: {
            type: GraphQLString,
            resolve: data => data.key
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.value.count
        },
        name: {
            type: GraphQLString,
            resolve: data => data.value.name
        },
        category: {
            type: GraphQLString,
            resolve: data => data.value.category
        },
        unitPrice: {
            type: GraphQLString,
            resolve: data => data.value.price
        }
    })
})

const SearchStatType = new GraphQLObjectType({
    name: 'SearchStatType',
    description: '...',

    fields: () => ({
        channels: {
            type: new GraphQLList(SearchChannelType),
            resolve: (data) => {
                let channelMap = new Map
                data.forEach(element => {
                    if (channelMap.has(element.dvce_type)) {
                        channelMap.set(element.dvce_type, +channelMap.get(element.dvce_type) + +element.total)
                    } else {
                        channelMap.set(element.dvce_type, +element.total)
                    }
                })
                return utils.mapToArray(channelMap)
            }
        },
        topSearchKeywordsStat: {
            type: new GraphQLList(TopSearchKeywordsStatType),
            args: {
                count: {
                    type: GraphQLInt
                }
            },
            resolve: (data, args) => {
                let channelMap = new Map
                data.forEach(element => {
                    let searchTerms = element.terms
                    if (searchTerms) {
                        searchTerms = searchTerms.substring(2, searchTerms.length - 2)
                    }
                    if (channelMap.has(searchTerms)) {
                        channelMap.set(searchTerms, +channelMap.get(searchTerms) + +element.total)
                    } else {
                        channelMap.set(searchTerms, +element.total)
                    }
                })
                let totalItemsToReturn = channelMap.size
                if (args && args.count) {
                    totalItemsToReturn = args.count
                }
                return utils.mapToArray(channelMap)
                    .sort((elem1, elem2) => elem2.value - elem1.value)
                    .slice(0, args.count)
            }
        }
    })
})

const SearchChannelType = new GraphQLObjectType({
    name: 'SearchChannelType',
    description: '...',

    fields: () => ({
        device: {
            type: GraphQLString,
            resolve: data => data.key
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.value
        }
    })
})
const TopSearchKeywordsStatType = new GraphQLObjectType({
    name: 'TopSearchKeywordsStatType',
    description: '...',

    fields: () => ({
        keyword: {
            type: GraphQLString,
            resolve: data => data.key
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.value
        }
    })
})

const TransactionStatType = new GraphQLObjectType({
    name: 'TransactionStatType',
    description: '...',

    fields: () => ({
        country: {
            type: GraphQLString,
            resolve: data => data.tr_country
        },
        device: {
            type: GraphQLString,
            resolve: data => data.dvce_type
        },
        count: {
            type: GraphQLInt,
            resolve: data => data.count
        }, 
        total: {
            type: GraphQLFloat,
            resolve: data => data.total
        },
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
                type: new GraphQLList(ClientType),
                args: {
                    startDate: {
                        type: GraphQLString
                    },
                    endDate: {
                        type: GraphQLString
                    },
                    app_ids: {
                        type: new GraphQLList(GraphQLString)
                    }
                },
                resolve: (root, args, context) => {
                    let clients
                    if (args.app_ids) {
                        clients = args.app_ids[0].split(',')
                    }
                    return context.clientsLoader.load([args.startDate, args.endDate, clients])
                }
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
                resolve: (root, args, context) => context.clientLoader.loadMany([
                    [args.app_id, args.startDate, args.endDate]
                ])
            },
            status: {
                type: new GraphQLList(StatusType),
                args: {
                    startDate: {
                        type: GraphQLString
                    }
                },
                resolve: (root, args, context) => context.statusLoader.load([args.startDate])
            },
        })
    }),
    mutation: ClientMutationType
})