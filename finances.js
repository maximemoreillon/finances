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
if(!process.env.NODE_ENV === 'development') app.use(auth.middleware)

const balance_controller = require('./controllers/balance.js')
const transaction_controller = require('./controllers/transactions.js')
const transaction_category_controller = require('./controllers/transaction_categories.js')

// Note: Routing difficult because some accounts do not have transactions or balance history


app.use('/accounts', require('./routes/accounts.js'))

app.route('/accounts/:account/balance')
  .get(balance_controller.get_current_balance)
  .post(balance_controller.register_balance)

app.route('/accounts/:account/balance/current')
  .get(balance_controller.get_current_balance)

app.route('/accounts/:account/balance/history')
  .get(balance_controller.get_balance_history)

// Seems to be missing routes here
app.route('/balance')
  .post(balance_controller.register_balance)

app.route('/balance/accounts')
  .get(balance_controller.get_accounts)



// TRANSACTIONS RELATED ROUTES
app.route('/accounts/:account/transactions')
  .get(transaction_controller.get_transactions)

app.route('/transactions')
  .get(transaction_controller.get_transactions)
  .post(transaction_controller.register_transactions)

// NOT RESTFUL
app.route('/transaction')
  .get(transaction_controller.get_transaction)
  .put(transaction_controller.update_transaction)
  .delete(transaction_controller.delete_transaction)
  .post(transaction_controller.register_transactions)

app.get('/transaction_accounts', transaction_controller.get_accounts)

app.route('/transactions/accounts')
  .get(transaction_controller.get_accounts)

// Transaction categories
app.route('/transactions/categories')
  .get(transaction_category_controller.get_categories)
  .post(transaction_category_controller.create_category)

app.route('/transactions/categories/:category_id')
  .get(transaction_category_controller.get_category)
  .put(transaction_category_controller.update_category)
  .delete(transaction_category_controller.delete_category)




// Start server
app.listen(APP_PORT, () => {console.log(`[Express] Finances API listening on *:${APP_PORT}`)})
