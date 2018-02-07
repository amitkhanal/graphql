module.exports = {
    mapToObject: map => {
        const out = [Object.create(null)]
        map.forEach((value, key) => {
            if (value instanceof Map) {
                out[key] = map_to_object(value)
            } else {
                out[key] = value
            }
        })
        return out
    },
    mapToArray: (map, threshold) => {
        const list = []
        map.forEach((value, key) => {
            if(threshold && !(value >= threshold))
                return
            list.push(key + '==>' + value)
        })
        return list
    },
    getFilterdMap: (data,key,filterName) => {
        let statMap = new Map
        data.forEach(function (elem) {
            let val = elem[key]
            if(filterName && filterName != val){
                return
            }
            else if (val == null) {
                val = 'unknown'
            }
            if (statMap.has(val)) {
                let total = statMap.get(val) + +elem.count
                statMap.set(val, total)
            } else {
                statMap.set(val, +elem.count)
            }
        })
        return statMap
    }
}