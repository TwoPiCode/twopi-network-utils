require('es6-promise').polyfill()
require('fetch-everywhere')

const GET = 'GET'
const POST = 'POST'
const POST_FILE = 'POSTFILE'
const PUT = 'PUT'
const DELETE = 'DELETE'
const PATCH = 'PATCH'

function JSONParseError(status, body) {
  this.name = 'JSONParseError'
  this.status = status
  this.body = body
  this.message = 'Received unexpected response from the server.'
  this.stack = (new Error()).stack
}
JSONParseError.prototype = Object.create(Error.prototype)
JSONParseError.prototype.constructor = JSONParseError

function Non200Error(status, body) {
  this.name = 'Non200Error'
  this.status = status
  this.body = body
  this.message = 'A network error occurred. Please try again.'
  this.stack = (new Error()).stack
}
Non200Error.prototype = Object.create(Error.prototype)
Non200Error.prototype.constructor = Non200Error

function BadReturnType(type) {
  this.name = 'BadReturnType'
  this.message = '\'' + type + '\' is an invalid \'rtype\' option. The options are [\'json\', \'file\', \'string\']'
  this.stack = new Error().stack
}
BadReturnType.prototype = Object.create(Error.prototype)
BadReturnType.prototype.constructor = BadReturnType

const contentType = {
  GET: 'application/x-www-form-urlencoded',
  POST: 'application/json',
  PUT: 'application/json',
  DELETE: 'application/json',
  PATCH: 'application/json'
}

const requestFactory = (meth, notify = null) => {
  let methodHeaders = {}

  // We need this to be able to send formData
  if (meth === POST_FILE) {
    meth = POST
  } else {
    methodHeaders['Content-Type'] = contentType[meth]
  }

  return (token, path, body = undefined, options = {}, headers = {}) => {
    let finalHeaders = {
      ...methodHeaders,
      ...headers
    }

    if (token) {
      finalHeaders['Authorization'] = 'Bearer ' + token
    }

    const available = ['json', 'file', 'string']
    if (!options.hasOwnProperty('rtype')){
      options['rtype'] = 'json'
    } else if (available.indexOf(options['rtype']) < 0){
      return Promise.reject(new BadReturnType(options['rtype']))
    }

    return fetch(path, {
      ...options,
      headers: finalHeaders,
      method: meth,
      body: body
    }).then(resp => {

      const checkAndResolve = (data) => {
        if (resp.status < 200 || resp.status > 300) {
          if (notify)
            if (data._errors === undefined)
              notify('Received unexpected response from the server')
            else
              notify(data._errors.join('\n'))
          throw new Non200Error(resp.status, data)
        } else {
          return data
        }
      }

      switch (options['rtype']) {
      case 'json':
        return resp.json().catch(() => {
          if (notify)
            notify('Received unexpected response from the server')
          throw new JSONParseError(resp.status)
        }).then(checkAndResolve)
      case 'file':
        return resp.blob().then(checkAndResolve)
      case 'string':
        return resp.text().then(checkAndResolve)
      }
    })
  }
}

module.exports = {requestFactory, GET, POST, POST_FILE, PUT, DELETE, PATCH, JSONParseError, Non200Error}
