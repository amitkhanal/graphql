const data = [ 
  { platform: 'web',
​​​​​    tr_country: null,
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Firefox 45',​​​​​
​​​​​    geo_region_name: null,​​​​​
​​​​​    count: '8' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: 'Argentina',​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Chrome',​​​​​
​​​​​    geo_region_name: 'Distrito Federal',​​​​​
​​​​​    count: '25' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Internet Explorer 11',​​​​​
​​​​​    geo_region_name: 'New York',​​​​​
​​​​​    count: '20' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Chrome',​​​​​
​​​​​    geo_region_name: 'Sao Paulo',​​​​​
​​​​​    count: '183' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Mobile',​​​​​
​​​​​    br_name: 'Chrome Mobile',​​​​​
​​​​​    geo_region_name: 'Distrito Federal',​​​​​
​​​​​    count: '370' },​​​​​
​​​​​  { platform: 'mob',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Mobile',​​​​​
​​​​​    br_name: 'Chrome Mobile',​​​​​
​​​​​    geo_region_name: 'Maharashtra',​​​​​
​​​​​    count: '1' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Microsoft Edge',​​​​​
​​​​​    geo_region_name: 'Maharashtra',​​​​​
​​​​​    count: '5' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: 'Argentina',​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Internet Explorer 11',​​​​​
​​​​​    geo_region_name: 'Distrito Federal',​​​​​
​​​​​    count: '1' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Internet Explorer 11',​​​​​
​​​​​    geo_region_name: 'California',​​​​​
​​​​​    count: '62' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Firefox',​​​​​
​​​​​    geo_region_name: 'Distrito Federal',​​​​​
​​​​​    count: '2' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Chrome',​​​​​
​​​​​    geo_region_name: 'Maharashtra',​​​​​
​​​​​    count: '640' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Chrome',​​​​​
​​​​​    geo_region_name: null,​​​​​
​​​​​    count: '476' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Chrome',​​​​​
​​​​​    geo_region_name: 'Distrito Federal',​​​​​
​​​​​    count: '2859' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Firefox',​​​​​
​​​​​    geo_region_name: 'Maharashtra',​​​​​
​​​​​    count: '4' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Internet Explorer 11',​​​​​
​​​​​    geo_region_name: 'Distrito Federal',​​​​​
​​​​​    count: '46' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Chrome',​​​​​
​​​​​    geo_region_name: 'California',​​​​​
​​​​​    count: '54' },​​​​​
​​​​​  { platform: 'srv',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Unknown',​​​​​
​​​​​    br_name: 'Unknown',​​​​​
​​​​​    geo_region_name: 'Oregon',​​​​​
​​​​​    count: '9' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Chrome 49',​​​​​
​​​​​    geo_region_name: 'Distrito Federal',​​​​​
​​​​​    count: '29' },​​​​​
​​​​​  { platform: 'web',​​​​​
​​​​​    tr_country: null,​​​​​
​​​​​    dvce_type: 'Computer',​​​​​
​​​​​    br_name: 'Internet Explorer 11',​​​​​
​​​​​    geo_region_name: 'Maharashtra',​​​​​
​​​​​    count: '12' } ]​​​​​

data.reduce(function(total, value) {
    console.log('total '+ total)
    console.log('value '+ value);
})


console.log(('​​,​​​​​').charCodeAt(0))