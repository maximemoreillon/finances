// NPM modules
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const auth = require('@moreillon/authentication_middleware')
const {connect: mongodb_connect, url: mongodb_url, db: mongodb_db} = require('./mongodb.js')
const {url: influxdb_url, db: influxdb_db} = require('./influxdb.js')

const {version, author} = require('./package.json')


const {
  APP_PORT = 80
} = process.env


// Set timezone
process.env.TZ = 'Asia/Tokyo';

// configure the authorization middleware
auth.authentication_api_url = `${process.env.AUTHENTICATION_API_URL}/decode_jwt`

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
  })
})

// Authenticate everything from here
if(process.env.NODE_ENV !== 'development') app.use(auth.middleware)

const balance_controller = require('./controllers/balance.js')
const transaction_controller = require('./controllers/transactions.js')
const transaction_category_controller = require('./controllers/transaction_categories.js')

// Note: Routing difficult because some accounts do not have transactions or balance history


app.use('/accounts', require('./routes/accounts.js'))
app.use('/balance', require('./routes/balance.js'))
app.use('/accounts/:account/balance', require('./routes/balance.js'))





// TRANSACTIONS RELATED ROUTES
app.use('/transactions', require('./routes/transactions.js'))
app.use('/accounts/:account/transactions', require('./routes/transactions.js'))


// Start server
app.listen(APP_PORT, () => {console.log(`[Express] Finances API listening on *:${APP_PORT}`)})
