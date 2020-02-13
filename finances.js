// NPM modules
const mongodb = require('mongodb');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieSession = require('cookie-session')
const cors = require('cors')
const history = require('connect-history-api-fallback');
const mongoose = require("mongoose");

// personal modules
const authorization_middleware = require('@moreillon/authorization_middleware');

// Mongoose models
const Transaction = require('./models/transaction');
const BalanceEntry = require('./models/balanceEntry');

// local modules
const secrets = require('./secrets');

const DB_config = {
  DB_URL: secrets.mongodb_url,
  DB_name: secrets.db_name,
  balance_collection_name: secrets.balance_collection_name,
  constructor_options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
}

mongoose.connect(secrets.mongodb_url + 'finances', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});


const port = 8086;

// Set timezone
process.env.TZ = 'Asia/Tokyo';

// configure the authorization middleware
authorization_middleware.secret = secrets.jwt_secret


// Instanciate objects
var ObjectID = mongodb.ObjectID;
var MongoClient = mongodb.MongoClient;
var app = express();
var http_server = http.Server(app);

// Express configuration
app.use(bodyParser.json());
app.use(history());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cors());



app.use(authorization_middleware.middleware);

// Express routes
app.post('/get_current_balance', (req, res) => {
  MongoClient.connect(DB_config.DB_URL, DB_config.constructor_options, (err, db) => {
    if (err) throw err;
    db.db(DB_config.DB_name)
    .collection(DB_config.balance_collection_name)
    .find({}).sort({date: -1}).limit(1)
    .toArray((err, result) => {
      if (err) throw err;
      db.close();
      res.send(result[0].balance);
    });
  });
});

app.post('/get_balance_history',  (req, res) => {
  MongoClient.connect(DB_config.DB_URL, DB_config.constructor_options, (err, db) => {
    if (err) throw err;
    db.db(DB_config.DB_name)
    .collection(DB_config.balance_collection_name)
    .find({}).sort({date: -1})
    .toArray((err, result) => {
      if (err) throw err;
      db.close();
      res.send(result);
    });
  });
});

app.post('/register_balance_entry', (req,res) => {

  const balance_entry = new BalanceEntry(req.body.balance_entry);
  balance_entry.save()
  .then(() => res.send("OK"))
  .catch(error => console.log(error))

})

app.post('/register_balance_entries', (req,res) => {

  let bulk_operations = []
  for (var balance_entry of req.body.balance_entries) {
    bulk_operations.push({
      updateOne: {
        filter: balance_entry,
        update: balance_entry,
        upsert: true
      }
    })
  }

  BalanceEntry.bulkWrite(bulk_operations)
  .then( bulkWriteOpResult => {
    console.log('BULK update OK');
    res.send('OK')
  })
  .catch( err => {
    console.log(err);
    res.status(500)
  });

})


app.post('/transactions', (req,res) => {
  // Route to get all transactions
  Transaction.find({account: req.body.account}, (err, docs) => {
    if (err) return res.status(500);
    res.send(docs)
  })
});

app.post('/register_transactions', (req,res) => {

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
  .then( bulkWriteOpResult => {
    console.log('BULK update OK');
    res.send('OK')
  })
  .catch( err => {
    console.log(err);
    res.status(500)
  });

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
http_server.listen(port, () => {
  console.log(`Finances manager listening on *:${port}`);
});
