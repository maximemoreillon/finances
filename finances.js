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



// TRANSACTIONS RELATED ROUTES
app.get('/transactions', (req,res) => {
  // Route to get all transactions

  let account = req.query.account
    || req.query.account_name
    || req.params.account
    || req.params.account_name

  if(!account) return res.status(400).send(`Missing account name`)

  Transaction
    .find({account: account})
    .sort({date: -1})
    .exec((err, docs) => {
      if (err) return res.status(500).send("Error retrieving transactions from DB")
      res.send(docs)
    })
})

app.get('/transaction', (req,res) => {
  // Route to get a single transaction
  Transaction.findById(req.query._id, (err, transaction) => {
    if(err) return res.status(500).send("Transaction not found")
    res.send(transaction)
  })
})

app.put('/transaction', (req,res) => {
  // Route to update a transaction
  Transaction.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, transaction) => {
    if(err) return res.status(500).send("Error updating transaction")
    res.send(transaction)
  })
})

app.delete('/transaction', (req,res) => {
  // Route to delete a transaction
  Transaction.findByIdAndDelete(req.query._id, (err, transaction) => {
    if(err) return res.status(500).send("Error deleting transaction")
    res.send('OK')
  });
});

app.post('/register_transactions', (req,res) => {
  // Route to register multiple transactions
  let bulk_operations = []
  for (var transaction of req.body.transactions) {
    bulk_operations.push({
      updateOne: {
        filter: transaction,
        update: transaction,
        upsert: true
      }
    })
  }

  Transaction.bulkWrite(bulk_operations)
  .then( bulkWriteOpResult => res.send('OK'))
  .catch( err => res.status(500).send("Error writing to DB"))

})

app.get('/transaction_accounts', (req,res) => {
  // Route to get a single transaction
  Transaction.find().distinct('account', (err, transaction) => {
    if(err) return res.status(500).send("Error getting accounts")
    res.send(transaction)
  })
})



// Start server
app.listen(port, () => {
  console.log(`Finances API listening on *:${port}`);
});
