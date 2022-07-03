require('dotenv').config()

const express = require('express')
const cors = require('cors')
const auth = require('@moreillon/express_identification_middleware')
const group_auth = require('@moreillon/express_group_based_authorization_middleware')
const {connect: mongodb_connect, url: mongodb_url, db: mongodb_db} = require('./mongodb.js')
const {url: influxdb_url, db: influxdb_db} = require('./influxdb.js')

const {version, author} = require('./package.json')

console.log(`Finances manager v${version}`);

const {
  APP_PORT = 80,
  IDENTIFICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL
} = process.env

// Set timezone
process.env.TZ = 'Asia/Tokyo'


mongodb_connect()

const app = express()

// Express configuration
app.use(express.json())
app.use(cors())

app.get('/', (req,res) => {
  res.send({
    application_name: 'Finances API',
    author,
    version,
    mongodb: { url: mongodb_url, db: mongodb_db },
    influxdb: {url: influxdb_url, db: influxdb_db},
    auth: {
      identification_url: IDENTIFICATION_URL,
      group_auth: {
        url: GROUP_AUTHORIZATION_URL,
        groups: AUTHORIZED_GROUPS
      }
    }
  })
})

// Authenticate everything from here
if (process.env.NODE_ENV !== 'development') app.use(auth({ url: IDENTIFICATION_URL }))
if(AUTHORIZED_GROUPS && GROUP_AUTHORIZATION_URL) {
  console.log(`[Auth] Enabling group-based authorization`)
  const group_auth_options = {
    url: GROUP_AUTHORIZATION_URL,
    groups: AUTHORIZED_GROUPS.split(',')
  }
  app.use(group_auth(group_auth_options))
}


app.use('/accounts', require('./routes/accounts.js'))
app.use('/balance', require('./routes/balance.js'))
app.use('/accounts/:account/balance', require('./routes/balance.js'))

app.use('/transactions', require('./routes/transactions.js'))
app.use('/accounts/:account/transactions', require('./routes/transactions.js'))


// Start server
app.listen(APP_PORT, () => {console.log(`[Express] Finances API listening on *:${APP_PORT}`)})
