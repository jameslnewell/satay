
module.exports = {

  bucket: 'jameslnewell.me',
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
        CacheControl: `max-age=${60*60*24*365.25}, public`
      }
    }

  ]

};
