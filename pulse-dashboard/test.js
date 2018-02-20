const data = [
  {
    p: 'web',
    tr_country: null,
    dvce_type: 'Computer',
    br_name: 'Firefox 45'
  },
 {
    p: 'web',
    tr_country: 'Arg',
    dvce_type: 'Computer',
    br_name: 'Firefox 45'
  },
 {
    p: 'web',
    tr_country: 'Brazil',
    dvce_type: 'Computer',
    br_name: 'Firefox 45'
  },
 {
    p: 'web',
    tr_country: 'Arg',
    dvce_type: 'Computer',
    br_name: 'Firefox 45'
  },
 {
    p: 'web',
    tr_country: 'Bra',
    dvce_type: 'Computer',
    br_name: 'Firefox 45'
  },
  {
    p: 'web',
    tr_country: 'Bra1',
    dvce_type: 'Computer',
    br_name: 'Firefox 45'
  }
]

console.log(

  data.map(elem => elem.tr_country) .filter( (element, index, array) => index == array.indexOf(element))
)
 