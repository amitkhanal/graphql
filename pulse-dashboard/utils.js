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
            list.push({key:key,value:value})
        })
        return list
    },
    getFilterdMap: (data, app_id, key, filterName) => {
        let statMap = new Map
        data.forEach(elem => {
            let val = elem[key]
            if (app_id != elem.app_id) {
                return
            }
            if (filterName && filterName != val && filterName != 'unknown') {
                return
            }
            else if (val == null) {
                val = 'unknown'
            }
            let total=0
            let regionMap
            if (statMap.has(val)) {
                total = +statMap.get(val).count + +elem.count
                statMap.get(val).count = +total
                regionMap = statMap.get(val).regions
                if(regionMap.has(elem.geo_region_name)){
                    regionMap.set(elem.geo_region_name, + regionMap.get(elem.geo_region_name) + +elem.count)
                }else{
                    regionMap.set(elem.geo_region_name, +elem.count)
                }
                
            } else {
                total += +elem.count
                let obj = {count:total}
                statMap.set(val, obj)
                if(!statMap.get(val).regions){
                    regionMap = new Map
                    regionMap.set(elem.geo_region_name, elem.count)
                    statMap.get(val).regions = regionMap
                }else {
                    regionMap = statMap.get(val).regions
                    statMap.get(val).regions.set(elem.geo_region_name, +regionMap.get(elem.geo_region_name) + +elem.count)
                }
            }
            
        })
        return statMap
    }
/* 
    convertArrayToString: (array) => {
        let output=''
        console.log('array ' + array)
        //console.log("@@@ " + JSON.stringify(array).split(','))
        //console.log('join > ' + array.map(element => '"'))
       
        array.forEach(element => {
            output += '\''+element+'\''+','
            //console.log('\n**** - ' + output)
            //output += element+','
        }) 
        //output = array.join(',')
        output = ('\''+array.join('\',')+'\'')
        console.log('oout  ' + output)
        return output
    } */
}

