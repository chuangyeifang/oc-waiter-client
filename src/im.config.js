const opts = {
  cookieName: 'OMW-Passport',
  imServer: {
    protocol: process.env.VUE_APP_SERVER_PROTOCOL,
    host: process.env.VUE_APP_SERVER_DOMAIN,
    port: process.env.VUE_APP_SERVER_PORT
  },
  imApi: {
    protocol: process.env.VUE_APP_API_PROTOCOL,
    host: process.env.VUE_APP_API_DOMAIN,
    port: process.env.VUE_APP_API_PORT
  }
}

module.exports = opts
