require('es6-promise').polyfill()
require('fetch-everywhere')

const GET = 'GET'
const POST = 'POST'
const POST_FILE = 'POSTFILE'
const PUT = 'PUT'
const DELETE = 'DELETE'


const JSONParseError = 'JSONParseError'
const Non200Error = 'Non200Error'

const contentType = {
  GET: 'application/x-www-form-urlencoded',
  POST: 'application/json',
  PUT: 'application/json',
  DELETE: 'application/json',
}

const networkError = (status, errorType, body, notify, message) => {
  const errorMessage = message || 'A network error occurred. Please try again.'
  const e = new Error(errorMessage)
  e.status = status
  e.errorType = errorType
  if (body) {
    e.body = body
  }
  if (notify) notify(errorMessage)
  return e
}

const requestFactory = (meth, notify = null) => {
  let _headers = {}

  // We need this to be able to send formData
  if (meth === POST_FILE) {
    meth = POST
  } else {
    _headers['Content-Type'] = contentType[meth]
  }

  return (token, path, body = undefined, options = {}, headers = {}) => {
    if (token) {
      _headers['Authorization'] = 'Bearer ' + token
    }

    return fetch(path, {
      ...options,
      headers: {
        ..._headers,
        ...headers
      },
      method: meth,
      body: body
    }).then(resp => {
      return resp.json().catch(err => {
        throw networkError(resp.status, JSONParseError, undefined, notify, 'Received unexpected response from the server.')
      }).then(json => {
        if (resp.status < 200 || resp.status > 300) {
          throw networkError(resp.status, Non200Error, json)
        } else {
          return Promise.resolve(json)
        }
      })
    })
  }
}

module.exports = {requestFactory, GET, POST, POST_FILE, PUT, DELETE, JSONParseError, Non200Error}
