// NPM modules
const mongodb = require('mongodb');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieSession = require('cookie-session')
const cors = require('cors')
const history = require('connect-history-api-fallback');

// personal modules
const authorization_middleware = require('@moreillon/authorization_middleware');

// local modules
const credentials = require('../common/credentials');
const misc = require('../common/misc');

const DB_config = {
  DB_URL: "mongodb://localhost:27017/",
  DB_name: "finances",
  balance_collection_name: "resona_balance",
  bank_account_transactions_collection_name: "bank_account_transactions",
  credit_card_transactions_collection_name: "credit_card_transactions",
  constructor_options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
}

const port = 8086;

// Set timezone
process.env.TZ = 'Asia/Tokyo';

// configure the authorization middleware
authorization_middleware.secret = credentials.jwt.secret


// Instanciate objects
var ObjectID = mongodb.ObjectID;
var MongoClient = mongodb.MongoClient;
var app = express();
var http_server = http.Server(app);

// Express configuration
app.use(bodyParser.json());
app.use(history());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cors({
  //origin: misc.cors_origins,

  // Hack to allow all origins
  origin: (origin, callback) => {
    callback(null, true)
  },

  credentials: true,
}));
app.use(cookieSession({
  name: 'session',
  secret: credentials.session.secret,
  maxAge: 253402300000000,
  sameSite: false,
  domain: '.maximemoreillon.com'
}));


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

app.post('/credit_card_transactions', (req, res) => {
  MongoClient.connect(DB_config.DB_URL, DB_config.constructor_options, (err, db) => {
    if (err) throw err;
    db.db(DB_config.DB_name)
    .collection(DB_config.credit_card_transactions_collection_name)
    .find({}).sort({date: -1})
    .toArray((err, result) => {
      if (err) throw err;
      db.close();
      res.send(result);
    });
  });
});

app.post('/bank_account_transactions', (req, res) => {
  MongoClient.connect(DB_config.DB_URL, DB_config.constructor_options, (err, db) => {
    if (err) throw err;
    db.db(DB_config.DB_name)
    .collection(DB_config.bank_account_transactions_collection_name)
    .find({}).sort({ date: -1 })
    .toArray((err, result) => {
      if (err) throw err;
      db.close();
      res.send(result);
    });
  });
});

// Route to register transactions



// Start server
http_server.listen(port, () => {
  console.log(`Finances manager listening on *:${port}`);
});
