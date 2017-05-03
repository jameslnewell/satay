
module.exports = {

  bucket: 'jameslnewell.id',
  region: 'ap-southeast-2',

  groups: [

    {
      source: './static',
      include: /\.html$/,
    },

    //cache cache-bustable assets for up to 1 year
    {
      source: './static',
      exclude: /\.html$/,
      params: {
        CacheControl: `Cache-Control: max-age=${60*60*24*365.25}, public`
      }
    }

  ]

};
