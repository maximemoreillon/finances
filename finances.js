// NPM modules
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require("mongoose")
const Influx = require('influx')
const dotenv = require('dotenv')


const axios = require('axios')
// personal modules
const authentication_middleware = require('@moreillon/authentication_middleware')

dotenv.config()

// Mongoose models
const Transaction = require('./models/transaction')

var port = 80
if(process.env.APP_PORT) port=process.env.APP_PORT

const DB_name = 'finances'

mongoose.connect(`${process.env.MONGODB_URL}/${DB_name}`, {
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
authentication_middleware.authentication_api_url = `${process.env.AUTHENTICATION_API_URL}/decode_jwt`

var app = express();

// Express configuration
app.use(bodyParser.json())
app.use(cors())
app.use(authentication_middleware.middleware)

app.get('/', (req,res) => {
  res.send(`Finances API, Maxime MOREILLON`)
})


const balance_controller = require('./controllers/balance.js')

app.route('/balance')
  .post(balance_controller.register_balance)


// Legacy
app.post('/register_balance', balance_controller.register_balance)

app.get('/balance_history', (req,res) => {
  influx.query(`SELECT * FROM ${req.query.account}`)
  .then( result => res.send(result) )
  .catch( error => res.status(500).send(`Error getting balance from Influx: ${error}`) );
})

app.get('/current_balance', (req,res) => {
  influx.query(`SELECT * FROM ${req.query.account} GROUP BY * ORDER BY DESC LIMIT 1`)
  .then( result => res.send(result[0].balance) )
  .catch( error => res.status(500).send(`Error getting balance from Influx: ${error}`) );
})

app.get('/balance_accounts', (req,res) => {
  influx.query(`SHOW MEASUREMENTS`)
  .then( result => res.send(result) )
  .catch( error => res.status(500).send(`Error getting measurements from Influx: ${error}`) );
})

const transaction_controller = require('./controllers/transactions.js')

// TRANSACTIONS RELATED ROUTES
app.get('/transactions', transaction_controller.get_transactions)

app.route('/transaction')
  .get(transaction_controller.get_transaction)
  .put(transaction_controller.update_transaction)
  .delete(transaction_controller.delete_transaction)
  .post(transaction_controller.register_transactions)


app.get('/transaction_accounts', transaction_controller.get_accounts)



// Start server
app.listen(port, () => {
  console.log(`Finances API listening on *:${port}`);
});
