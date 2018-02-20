const utils = require('./utils')

const {
    GraphQLInt,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} = require('graphql')

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
                let countryMap = utils.getFilterdMap(data.stat,data.app_id,'tr_country',args.name)
                return utils.mapToArray(countryMap,args.threshold)
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
                let statMap = utils.getFilterdMap(data.stat,data.app_id,'dvce_type', args.name)
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
                let statMap = utils.getFilterdMap(data.stat,data.app_id,'br_name',args.name)
                return utils.mapToArray(statMap,args.threshold)

            }
        },
        addToCartStat: {
            type: AddToCartStatType,
            resolve: (data, args, context) => context.addToCartLoader.load([[data.app_id], data.startDate, data.endDate])
        },
        searchStat: {
            type: SearchStatType,
            args: {
                app_id: {
                    type: GraphQLString
                }
            },
            resolve: (data, args, context) => context.searchLoader.load([data.app_id, data.startDate, data.endDate])
        }
    })
})

const CountryStatType = new GraphQLObjectType({
    name: 'CountryStatType',
    description: '...',

    fields: () => ({
        country: {
            type: GraphQLString,
            resolve: data => data.key
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
                    if(channelMap.has(element.platform)){
                        channelMap.set(element.platform, +channelMap.get(element.platform) + +element.total)
                    }else {
                        channelMap.set(element.platform, +element.total)
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
            resolve: (data,args) => {
                let channelMap = new Map
                data.forEach(element => {
                    if(channelMap.has(element.sku)){
                        channelMap.set(element.sku, +channelMap.get(element.sku).total + +element.total)
                    }else {
                        channelMap.set(element.sku, {name: element.name, category: element.category, price: element.unitPrice, count: +element.total})
                    }
                })
                let totalItemsToReturn = channelMap.size
                if(args && args.count){
                    totalItemsToReturn = args.count
                }
                return utils.mapToArray(channelMap)
                     .sort( (elem1, elem2) => elem2.value - elem1.value)
                     .slice(0,args.count)
            }
        }
    })
})

const AddToCartChannelType = new GraphQLObjectType({
    name: 'AddToCartChannelType',
    description: '...',

    fields: () => ({
        platform: {
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
            resolve: data => data.value.total
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
                    if(channelMap.has(element.platform)){
                        channelMap.set(element.platform, +channelMap.get(element.platform) + +element.total)
                    }else {
                        channelMap.set(element.platform, +element.total)
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
            resolve: (data,args) => {
                let channelMap = new Map
                data.forEach(element => {
                    let searchTerms = element.terms
                    if(searchTerms){
                        searchTerms = searchTerms.substring(2,searchTerms.length-2)
                    }
                    if(channelMap.has(searchTerms)){
                        channelMap.set(searchTerms, +channelMap.get(searchTerms) + +element.total)
                    }else {
                        channelMap.set(searchTerms, +element.total)
                    }
                })
                let totalItemsToReturn = channelMap.size
                if(args && args.count){
                    totalItemsToReturn = args.count
                }
                return utils.mapToArray(channelMap)
                     .sort( (elem1, elem2) => elem2.value - elem1.value )
                     .slice(0,args.count)
            }
        }
    })
})

const SearchChannelType = new GraphQLObjectType({
    name: 'SearchChannelType',
    description: '...',

    fields: () => ({
        channel: {
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
                resolve: (root, args, context) => context.clientsLoader.load([args.startDate, args.endDate])
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
                resolve: (root, args, context) => context.clientLoader.loadMany([[args.app_id, args.startDate, args.endDate]])
            },
            status: {
                type: new GraphQLList(StatusType),
                args: {
                    startDate: {
                        type: GraphQLString
                    }
                },
                resolve: (root, args, context) => context.statusLoader.load([args.startDate])
                   //context.statusLoader.loadMany([[args.startDate]]) 
            },
        })
    })
})