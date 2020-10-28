'use strict'

const { test } = require('tap')
const Fastify = require('fastify')

const SECRET_LENGHT = 30

const buildApp = function (t) {
  const fastify = Fastify({ logger: { level: 'error' } })

  t.tearDown(() => fastify.close())

  return fastify
    .register(require('../totp'), { secretLength: SECRET_LENGHT })
    .ready()
    .then(() => fastify)
}

test('totp.generateSecret', async t => {
  const fastify = await buildApp(t)

  t.test('is registered', t => {
    t.plan(1)
    t.equal(typeof fastify.totp.generateSecret, 'function', 'as a function')
  })

  t.test('without args', async t => {
    t.plan(1)
    const secret = fastify.totp.generateSecret()
    t.equal(secret.ascii.length, SECRET_LENGHT, 'should generate a secret with default length')
  })

  t.test('with a custom length', async t => {
    t.plan(1)
    const length = 54
    const secret = fastify.totp.generateSecret(length)
    t.equal(secret.ascii.length, length, 'should generate a secret with given length')
  })
})

test('totp.generateToken', async t => {
  const fastify = await buildApp(t)

  t.test('is registered', t => {
    t.plan(1)
    t.equal(typeof fastify.totp.generateToken, 'function', 'as a function')
  })

  t.test('without args', async t => {
    t.plan(1)
    const result = fastify.totp.generateToken()
    t.equal(result, null, 'should return null')
  })

  t.test('with a secret', async t => {
    t.plan(1)
    const result = fastify.totp.generateToken('abcdefg')
    t.true(result && result.length > 0, 'should return a valid token')
  })
})

test('totp.generateAuthURL', async t => {
  const fastify = await buildApp(t)

  t.test('is registered', t => {
    t.plan(1)
    t.equal(typeof fastify.totp.generateAuthURL, 'function', 'as a function')
  })

  t.test('without args', async t => {
    t.plan(1)
    const result = fastify.totp.generateAuthURL()
    t.equal(result, null, 'should return null')
  })

  t.test('with a secret', async t => {
    t.plan(1)
    const result = fastify.totp.generateAuthURL('abcdefg')
    const isURL = (result.indexOf('otpauth://totp') === 0)
    t.equal(isURL, true, 'should return an auth URL')
  })

  t.test('with a secret and a label', async t => {
    t.plan(1)
    const label = 'test-url'
    const result = fastify.totp.generateAuthURL('abcdefg', label)
    const isURL = (result.indexOf(`otpauth://totp/${label}`) === 0)
    t.equal(isURL, true, 'should return an auth URL with given label')
  })
})

test('totp.generateQRCode', async t => {
  const fastify = await buildApp(t)

  t.test('is registered', t => {
    t.plan(1)
    t.equal(typeof fastify.totp.generateQRCode, 'function', 'as a function')
  })

  t.test('without args', async t => {
    t.plan(1)
    const result = await fastify.totp.generateQRCode()
    t.equal(result, null, 'should return null')
  })

  t.test('with a secret', async t => {
    t.plan(1)
    const result = await fastify.totp.generateQRCode('abcdefg')
    const isQRCode = (result.indexOf('data:image/png;base64') === 0)
    t.equal(isQRCode, true, 'should return a data URL with QRCode')
  })

  t.test('with a secret and a label', async t => {
    t.plan(1)
    const result = await fastify.totp.generateQRCode('abcdefg', 'test-qrcode')
    const isQRCode = (result.indexOf('data:image/png;base64') === 0)
    t.equal(isQRCode, true, 'should return a data URL with QRCode')
  })
})

test('totp.verify', async t => {
  const fastify = await buildApp(t)

  t.test('is registered', t => {
    t.plan(1)
    t.equal(typeof fastify.totp.verify, 'function', 'as a function')
  })

  t.test('passing a valid token for a secret', async t => {
    t.plan(1)
    const secret = 'HGOp]VSO[bV:T6?vgNe&'
    const token = fastify.totp.generateToken(secret, 'sha512')
    const result = fastify.totp.verify(secret, token, 'sha512')
    t.equal(result, true, 'should return true')
  })
})
