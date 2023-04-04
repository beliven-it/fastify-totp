'use strict'

const fp = require('fastify-plugin')
const speakeasy = require('@levminer/speakeasy')
const qrcode = require('qrcode')

const DEFAULT_TOTP_SECRET_LENGTH = 20
const DEFAULT_TOTP_LABEL = 'Fastify'
const DEFAULT_TOTP_WINDOW = 1
const DEFAULT_TOTP_ALG = 'sha512'
const DEFAULT_TOTP_STEP = 30

module.exports = fp(function (fastify, opts, next) {
  const TOTP_SECRET_LENGHT = opts.secretLength || DEFAULT_TOTP_SECRET_LENGTH
  const TOTP_LABEL = opts.totpLabel || DEFAULT_TOTP_LABEL
  const TOTP_WINDOW = opts.totpWindow || DEFAULT_TOTP_WINDOW
  const TOTP_ALG = opts.totpAlg || DEFAULT_TOTP_ALG
  const TOTP_STEP = opts.totpStep || DEFAULT_TOTP_STEP

  function generateTOTPSecret (length) {
    const secret = speakeasy.generateSecret({
      length: length || TOTP_SECRET_LENGHT
    })
    // WARNING: secret is NOT a string, but an object providing
    // the secret key encoded in several ways (ascii, base32, etc.)
    return secret
  }

  function generateTOTPToken (options = {}) {
    if (!options.secret) return null

    const token = speakeasy.totp({
      encoding: options.encoding || 'ascii',
      algorithm: options.algorithm || TOTP_ALG,
      step: options.step || TOTP_STEP,
      ...options
    })

    return token
  }

  function generateAuthURLFromSecret (options = {}) {
    if (!options.secret) return null

    const url = speakeasy.otpauthURL({
      label: options.label || TOTP_LABEL,
      algorithm: options.algorithm || TOTP_ALG,
      ...options
    })

    return url
  }

  async function generateQRCodeFromSecret (secret, label, algorithm) {
    const url = fastify.totp.generateAuthURL(secret, label, algorithm)

    if (!url) return null

    return qrcode.toDataURL(url)
  }

  function verifyTOTP (options = {}) {
    const result = speakeasy.totp.verifyDelta({
      encoding: options.encoding || 'ascii',
      window: options.window || TOTP_WINDOW,
      step: options.step || TOTP_STEP,
      ...options
    })
    return !!result
  }

  fastify.decorate('totp', {
    generateSecret: generateTOTPSecret,
    generateToken: generateTOTPToken,
    generateAuthURL: generateAuthURLFromSecret,
    generateQRCode: generateQRCodeFromSecret,
    verify: verifyTOTP
  })

  fastify.decorateRequest('totpVerify', verifyTOTP)

  next()
}, {
  fastify: '>=2.x',
  name: 'fastify-totp'
})
