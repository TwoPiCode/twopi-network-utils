require('es6-promise').polyfill()
require('fetch-everywhere')

const GET = 'GET'
const POST = 'POST'
const POST_FILE = 'POSTFILE'
const PUT = 'PUT'
const DELETE = 'DELETE'

const contentType = {
  GET: 'application/x-www-form-urlencoded',
  POST: 'application/json',
  PUT: 'application/json',
  DELETE: 'application/json',
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
      if (resp.status >= 200 && resp.status < 300) {
        return resp.json().catch(err => {
          const errorMessage = 'Received unexpected response from the server.'
          const e = new Error(errorMessage)
          e.errorMessage = errorMessage
          throw e
        })
      } else {
        return resp.json().then((err) => {
          let e = new Error(JSON.stringify(err))
          e.status = resp.status
          e.body = err
          throw e
        }).catch(err => {
          const errorMessage = 'Received unexpected response from the server.'
          const e = new Error(errorMessage)
          e.errorMessage = errorMessage
          throw e
        })
      }
    }).catch(e => {
      if (!e.status) {
        // Inject a status code for 'unknown'
        e.status = -1
        const msg = e.errorMessage || 'A network error occurred. Please try again.'
        if (notify) notify(msg)
      }
      console.log(e)
      return Promise.reject(e)
    })
  }
}

module.exports = {requestFactory, GET, POST, POST_FILE, PUT, DELETE}
