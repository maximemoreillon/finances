// NPM modules
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const history = require('connect-history-api-fallback')
const mongoose = require("mongoose")
const Influx = require('influx')

// personal modules
const authorization_middleware = require('@moreillon/authorization_middleware')

// local modules
const secrets = require('./secrets')

// Mongoose models
const Transaction = require('./models/transaction')

const port = 7086;
const DB_name = 'finances'

mongoose.connect(secrets.mongodb_url + DB_name, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});


const influx = new Influx.InfluxDB({
  host: secrets.influx_url,
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
  console.error(`Error creating Influx database!`);
})


// Set timezone
process.env.TZ = 'Asia/Tokyo';

// configure the authorization middleware
authorization_middleware.secret = secrets.jwt_secret


var app = express();

// Express configuration
app.use(history())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'dist')))
app.use(cors())
app.use(authorization_middleware.middleware)

app.post('/register_balance', (req,res) => {

  influx.writePoints(
    [
      {
        measurement: req.body.account,
        tags: {
          currency: req.body.currency,
        },
        fields: {
          balance: req.body.balance
        },
        timestamp: new Date(),
      }
    ], {
      database: DB_name,
      precision: 's',
    })
    .then( () => res.send("Balance registered successfully"))
    .catch(error => res.status(500).send(`Error saving data to InfluxDB! ${error}`));

})

app.post('/balance_history_influx', (req,res) => {
  influx.query(`select * from ${req.body.account}`)
  .then( result => res.send(result) )
  .catch( error => res.status(500).send(`Error getting balance from Influx: ${error}`) );
})

app.post('/get_current_balance', (req,res) => {
  influx.query(`select * from ${req.body.account} GROUP BY * ORDER BY DESC LIMIT 1`)
  .then( result => res.send(result[0].balance) )
  .catch( error => res.status(500).send(`Error getting balance from Influx: ${error}`) );
})


app.post('/transactions', (req,res) => {
  // Route to get all transactions of a given account
  Transaction.find({account: req.body.account}).sort({date: -1}).exec((err, docs) => {
    if (err) return res.status(500).send("Error retrieving transactions from DB")
    res.send(docs)
  })
});

app.post('/get_transaction', (req,res) => {
  // Route to get all transactions
  Transaction.findById(req.body._id, (err, transaction) => {
    if(err) return res.status(500).send("Transaction not found")
    res.send(transaction)
  });
});

app.post('/update_transaction', (req,res) => {
  // Route to get all transactions
  Transaction.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, transaction) => {
    if(err) return res.status(500).send("Error updating transaction")
    res.send(transaction)
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


app.post('/mark_as_business_expense', (req,res) => {
  Transaction.findByIdAndUpdate(req.body._id, {$set: {business_expense: true}}, (err, docs) => {
    if (err) return res.status(500);
    return res.send(docs)
  })
})

app.post('/mark_as_private_expense', (req,res) => {
  Transaction.findByIdAndUpdate(req.body._id, {$set: {business_expense: false}}, (err, docs) => {
    if (err) return res.status(500);
    return res.send(docs)
  })
})




// Start server
app.listen(port, () => {
  console.log(`Finances manager listening on *:${port}`);
});
