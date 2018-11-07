'use strict'

const assert = require('assert')
const express = require('express')

const API_TOKEN_EXPRESSION = /^token (.*)$/

const defaultOnError = (req, res, next, params) => {
  return res.status(401).send()
}

module.exports = function (config) {
  assert.strictEqual(typeof config.token, 'string', 'config.token must be a string')
  config.onError = config.onError || defaultOnError

  const router = express.Router()

  router.use((req, res, next) => {
    const authorization = req.get('Authorization') || ''
    const tokenMatches = API_TOKEN_EXPRESSION.exec(authorization)
    const token = tokenMatches ? tokenMatches[1] : req.query.token

    if (token !== config.token) {
      return config.onError(req, res, next, {
        expToken: config.token,
        actToken: token
      })
    }
    next()
  })

  return router
}
