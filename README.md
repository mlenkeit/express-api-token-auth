# express-api-token-auth

Secure express with an API token

I like to use this approach to secure some personal (i.e. single user) express apps.

## Installation

```shell
$ npm i -SE express-api-token-auth
```

## Usage

```javascript
const express = require('express')
const tokenAuth = require('express-api-token-auth')

const app = express()
app.use(tokenAuth({
  token: 'my-token',
  /* optional */
  onError: (req, res, next, params) => {
    // params.expToken
    // params.actToken
    return res.status(401).send()
  }
}))

// grant access to:
// - query parameter token=my-token
// - HTTP header Authorization:token my-token
```
