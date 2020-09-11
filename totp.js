'use strict'

const fp = require('fastify-plugin')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')

const DEFAULT_TOTP_SECRET_LENGTH = 20
const DEFAULT_TOTP_LABEL = 'Fastify'
const DEFAULT_TOTP_WINDOW = 1
const DEFAULT_TOTP_ALG = 'sha512'

module.exports = fp(function (fastify, opts, next) {
  const TOTP_SECRET_LENGHT = opts.secretLength || DEFAULT_TOTP_SECRET_LENGTH
  const TOTP_LABEL = opts.totpLabel || DEFAULT_TOTP_LABEL
  const TOTP_WINDOW = opts.totpWindow || DEFAULT_TOTP_WINDOW
  const TOTP_ALG = opts.totpAlg || DEFAULT_TOTP_ALG

  const generateTOTPSecret = async length => {
    const secret = speakeasy.generateSecret({
      length: length || TOTP_SECRET_LENGHT
    })
    // WARNING: secret is NOT a string, but an object providing
    // the secret key encoded in several ways (ascii, base32, etc.)
    return secret
  }

  const generateTOTPToken = async (secret, algorithm, encoding) => {
    if (!secret) return null

    const token = speakeasy.totp({
      secret,
      encoding: encoding || 'ascii',
      algorithm: algorithm || TOTP_ALG
    })

    return token
  }

  const generateAuthURLFromSecret = async (secret, label, algorithm) => {
    if (!secret) return null

    const url = speakeasy.otpauthURL({
      secret,
      label: label || TOTP_LABEL,
      algorithm: algorithm || TOTP_ALG
    })

    return url
  }

  const generateQRCodeFromSecret = async (secret, label, algorithm) => {
    const url = await fastify.totp.generateAuthURL(secret, label, algorithm)

    if (!url) return null

    return qrcode.toDataURL(url)
  }

  const verifyTOTP = async (secret, token, algorithm, encoding, window) => {
    const result = speakeasy.totp.verifyDelta({
      secret: secret,
      token: token,
      encoding: encoding || 'ascii',
      window: window || TOTP_WINDOW,
      algorithm
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

  next()
})
