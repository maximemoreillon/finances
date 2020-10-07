// NPM modules
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require("mongoose")
const Influx = require('influx')
const dotenv = require('dotenv')
const axios = require('axios')
const auth = require('@moreillon/authentication_middleware')

const pjson = require('./package.json')

dotenv.config()

// Mongoose models
const Transaction = require('./models/transaction')

var port = 80
if(process.env.APP_PORT) port=process.env.APP_PORT

const DB_name = process.env.MONGODB_DB_NAME || 'finances'
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://mongo:27017'

mongoose.connect(`${MONGODB_URL}/${DB_name}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});


const influx = new Influx.InfluxDB({
  host: process.env.INFLUXDB_URL,
  database: DB_name,
})

// Create DB if it does not exist
influx.getDatabaseNames()
.then(names => {
  if (!names.includes(DB_name)) {
    return influx.createDatabase(DB_name);
  }
})
.catch(err => {
  console.error(`Error creating Influx database! ${err}`);
})

// Set timezone
process.env.TZ = 'Asia/Tokyo';

// configure the authorization middleware
auth.authentication_api_url = `${process.env.AUTHENTICATION_API_URL}/decode_jwt`

var app = express()

// Express configuration
app.use(bodyParser.json())
app.use(cors())
app.use(auth.middleware)

app.get('/', (req,res) => {
  res.send({
    application_name: 'Finances API',
    version: pjson.version,
    mongodb_url: MONGODB_URL,
    mongodb_db_name: DB_name,
  })
})


const balance_controller = require('./controllers/balance.js')
const transaction_controller = require('./controllers/transactions.js')
const transaction_category_controller = require('./controllers/transaction_categories.js')

app.route('/balance')
  .post(balance_controller.register_balance)


// Legacy
app.post('/register_balance', balance_controller.register_balance)
app.get('/balance_history', balance_controller.get_balance_history)
app.get('/current_balance', balance_controller.get_current_balance)
app.get('/balance_accounts', balance_controller.get_accounts)



// TRANSACTIONS RELATED ROUTES
app.route('/transactions')
  .get(transaction_controller.get_transactions)
  .post(transaction_controller.register_transactions)

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
app.listen(port, () => {console.log(`Finances API listening on *:${port}`)})
