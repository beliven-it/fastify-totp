# fastify-totp

A plugin to handle TOTP (e.g. for 2FA)

## Install

```bash
$ npm i --save fastify-totp
```

## Usage

```js
fastify.register(require('fastify-totp'))

// ...

secret = await fastify.totp.generateSecret()

// You should now store secret.ascii in order to verify the TOTP.

const totp = req.body.token

isVerified = await fastify.totp.verify(secret.ascii, totp) 
```

The plugin includes also a facility to generate a **QRCode** that can be used
to easly configure third-party authenticators (*e.g. Google Authenticator*)

```js
qrcode = await fastify.totp.generateQRCode(secret.ascii)
```

## Options

| Name               | Description                                                                                  |
|--------------------|----------------------------------------------------------------------------------------------|
| `secretLength`     |  The length of the generated secret. *Default: 20*                                           |
| `totpLabel`        |  The label to show in third-party authenticators. Usually the app name. *Default: "Fastify"* |
| `totpWindow`       |  The allowable previous or future "time-windows" to check against of. *Default: 1*           |
| `totpAlg`          |  The algorithm to use for hash generation. *Default: "sha512"*                               |

**NOTE:** for more details, please take a look at [Speakeasy docs](https://www.npmjs.com/package/speakeasy#documentation).

## Test

```bash
$ npm test
```

## Acknowledgements

This project is kindly sponsored by:

[![heply](https://raw.githack.com/heply/brand/master/heply-logo.svg)](https://www.heply.it)

## License

Licensed under [MIT](./LICENSE)
