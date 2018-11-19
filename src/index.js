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

    return fetch(path, {
      ...options,
      headers: finalHeaders,
      method: meth,
      body: body
    }).then(resp => {
      // If the user does not want response converted to json include a "json": false mapping in the arguments[3]
      if ('json' in options && options['json'] === false){
        if (resp.status < 200 || resp.status > 300) {
          if (notify) notify('Received unexpected response from the server.')
          throw new Non200Error(resp.status, resp.text())
        }
        return Promise.resolve(resp.text())
      }

      return resp.json().catch(() => {
        if (notify)
          notify('Received unexpected response from the server.')
        throw new JSONParseError(resp.status)
      }).then(json => {
        if (resp.status < 200 || resp.status > 300) {
          if (notify)
            if (json._errors === undefined)
              notify('Received unexpected response from the server.')
            else
              notify(json._errors.join('\n'))
          throw new Non200Error(resp.status, json)
        } else {
          return Promise.resolve(json)
        }
      })
    }).catch(err => {
      console.error(err)
      notify('There was a network error. Please try again later.')
    })
  }
}

module.exports = {requestFactory, GET, POST, POST_FILE, PUT, DELETE, PATCH, JSONParseError, Non200Error}
