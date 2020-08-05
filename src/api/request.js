const requestPromise = require('request-promise')
const needle = require('needle')
const imConfig = require('../im.config')
const fs = require('fs')
const session = require('electron').remote.getGlobal('session')

// require('request-debug')(requestPromise)

const configs = {
  headers: {},
  baseUri: getUri(),
  cookieName: imConfig.cookieName
}

if (session && session.token) {
  configs.headers = {
    'Cookie': configs.cookieName + '=' + session.token,
    'User-Agent': 'Request-Promise'
  }
}

const errorMsg = 'code: 119 接口服务异常，请与技术人员联系!'

const request = {
  post(uri, params) {
    uri = unifyUri(uri)
    const options = {
      method: 'post',
      uri: uri,
      form: params,
      timeout: 3000,
      headers: configs.headers
    }
    return requestPromise(options)
  },
  get(uri, params) {
    uri = unifyUri(uri)
    const options = {
      method: 'GET',
      uri: uri,
      qs: params,
      json: true,
      timeout: 3000,
      headers: configs.headers
    }
    return requestPromise(options)
  },
  getExternal(uri, params) {
    const options = {
      method: 'GET',
      uri: uri,
      timeout: 3000,
      qs: params
    }
    return requestPromise(options)
  },
  upload(uri, filepath, callback) {
    uri = unifyUri(uri)
    const options = {
      headers: configs.headers,
      multipart: true
    }
    const fileForm = {
      file: {
        file: filepath,
        content_type: resolverFilePath(filepath)
      }
    }
    needle('post', uri, fileForm, options).then((res) => {
      callback(res.body)
    }).catch((error) => {
      callback({
        rc: -1,
        rm: errorMsg,
        error: error
      })
    })
  },
  download(uri, filepath, callback) {
    uri = unifyUri(uri)
    const options = {
      headers: configs.headers
    }
    var out = fs.createWriteStream(filepath)
    needle.get(uri, options).pipe(out).on('finish', () => {
      callback('成功导出')
    })
  }
}

function unifyUri(uri) {
  return configs.baseUri + (uri = uri.charAt(0) !== '/' ? '/' + uri : uri)
}

function getUri() {
  if (imConfig.imApi.port === 80) {
    return imConfig.imApi.protocol + imConfig.imApi.host
  }
  if (imConfig.imApi.port === 443) {
    return imConfig.imApi.protocol + imConfig.imApi.host
  }
  return imConfig.imApi.protocol + imConfig.imApi.host + ':' + imConfig.imApi.port
}

function resolverFilePath(filepath) {
  return 'image/' + filepath.substring(filepath.lastIndexOf('.') + 1, filepath.lenght)
}

export default request
