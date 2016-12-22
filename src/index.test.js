import {requestFactory, GET, Non200Error, JSONParseError} from './index'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import fetchMock from 'fetch-mock'

chai.use(chaiAsPromised)
chai.should()

let expect = chai.expect

describe('Network Util', function() {

  afterEach(fetchMock.restore)

  it('should return the correct response for a 200', function() {
    const responseToSend = {
      body: { hello: 'world' },
      status: 200
    }

    fetchMock.once('*', responseToSend)
    return requestFactory(GET)().then(json => {
      return expect(json).to.deep.equal(responseToSend.body)
    })
  })

  it('should return the correct status for a 401', function() {
    const responseToSend = {
      body: { hello: 'world' },
      status: 401
    }

    fetchMock.once('*', responseToSend)
    return requestFactory(GET)().catch(resp => {
      return expect(resp).to.be.an.instanceOf(Non200Error).and.to.have.a.property('status', 401)
    })
  })

  it('should return the correct status for a 403', function() {
    const responseToSend = {
      body: { hello: 'world' },
      status: 403
    }

    fetchMock.once('*', responseToSend)
    return requestFactory(GET)().catch(resp => {
      return expect(resp).to.be.an.instanceOf(Non200Error).and.to.have.a.property('status', 403)
    })
  })

  it('should return the correct status for a 500 (when there is a plaintext payload)', function() {
    const responseToSend = {
      body: '<html><body>Test</body></html>',
      status: 500
    }

    fetchMock.once('*', responseToSend)
    return requestFactory(GET)().catch(resp => {
      return expect(resp).to.be.an.instanceOf(JSONParseError).and.to.have.a.property('status', 500)
    })
  })

  it('should return the correct status for a 500 (when there is a json payload)', function() {
    const responseToSend = {
      body: { hello: 'world' },
      status: 500
    }

    fetchMock.once('*', responseToSend)
    return requestFactory(GET)().catch(resp => {
      return expect(resp).to.be.an.instanceOf(Non200Error).and.to.have.a.property('status', 500)
    })
  })

  it('should have the correct error for a non-json response', function() {
    const responseToSend = {
      body: '<html><body>Test</body></html>',
      status: 500
    }

    fetchMock.once('*', responseToSend)
    return requestFactory(GET)().catch(resp => {
      return expect(resp).to.be.an.instanceOf(JSONParseError).and.to.have.a.property('status', 500)
    })
  })
})