/* eslint-env mocha */
'use strict'

const express = require('express')
const expect = require('chai').expect
const request = require('supertest')

const alwaysRespond200Middleware = (req, res) => res.status(200).send()
const appFactory = middleware => {
  const app = express()
  app.use(middleware)
  app.use(alwaysRespond200Middleware)
  return app
}
const customOnErrorWithAssertions = function (req, res, next, params) {
  expect(req).to.be.an('object')
  expect(res).to.be.an('object')
  expect(next).to.be.a('function')
  expect(params).to.be.an('object')
  expect(params)
    .to.have.property('expToken', this.test.validToken)
  expect(params)
    .to.have.property('actToken', this.test.invalidToken)
  res.status(401).send('oh no!')
}

const middleware = require('./middleware')

describe('api-token-auth middleware', function () {
  beforeEach(function () {
    this.currentTest.validToken = '123'
    this.currentTest.invalidToken = 'someInvalidStr'
  })

  describe('with token in HTTP header', function () {
    beforeEach(function () {
      const app = appFactory(middleware({
        token: this.currentTest.validToken
      }))
      this.currentTest.app = app

      const validHeader = {
        'Authorization': `token ${this.currentTest.validToken}`
      }
      const invalidHeader = {
        'Authorization': `token ${this.currentTest.invalidToken}`
      }
      this.currentTest.validHeader = validHeader
      this.currentTest.invalidHeader = invalidHeader
    })

    it('calls the next middleware if token is valid', function (done) {
      request(this.test.app)
        .get('/')
        .set(this.test.validHeader)
        .expect(200)
        .end(done)
    })

    it('responds with 401 if token is invalid', function (done) {
      request(this.test.app)
        .get('/')
        .set(this.test.invalidHeader)
        .expect(401)
        .end(done)
    })

    it('invokes the onError function if token is invalid', function (done) {
      const app = appFactory(middleware({
        token: this.test.validToken,
        onError: customOnErrorWithAssertions.bind(this)
      }))
      this.test.app = app

      request(this.test.app)
        .get('/')
        .set(this.test.invalidHeader)
        .expect(401)
        .expect('oh no!')
        .end(done)
    })
  })

  describe('with token in query parameter', function () {
    beforeEach(function () {
      const app = appFactory(middleware({
        token: this.currentTest.validToken
      }))
      this.currentTest.app = app

      this.currentTest.uriWithValidToken = `/?token=${this.currentTest.validToken}`
      this.currentTest.uriWithInvalidToken = `/?token=${this.currentTest.invalidToken}`
    })

    it('calls the next middleware if token is valid', function (done) {
      request(this.test.app)
        .get(this.test.uriWithValidToken)
        .expect(200)
        .end(done)
    })

    it('responds with 401 if token is invalid', function (done) {
      request(this.test.app)
        .get(this.test.uriWithInvalidToken)
        .expect(401)
        .end(done)
    })

    it('invokes the onError function if token is invalid', function (done) {
      const app = appFactory(middleware({
        token: this.test.validToken,
        onError: customOnErrorWithAssertions.bind(this)
      }))
      this.test.app = app

      request(this.test.app)
        .get(this.test.uriWithInvalidToken)
        .expect(401)
        .expect('oh no!')
        .end(done)
    })
  })
})
