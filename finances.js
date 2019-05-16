// NPM modules
const mongodb = require('mongodb');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Custom modules
const credentials = require('./config/credentials');
const misc_config = require('./config/misc_config');
const DB_config = require('./config/db_config');

// Set timezone
process.env.TZ = 'Asia/Tokyo';

// Instanciate objects
var MongoClient = mongodb.MongoClient;
var app = express();
var http_server = http.Server(app);

// Express configuration
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Express routes
app.get('/', function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.balance_collection_name).find({}).toArray(function(err, find_result){
      if (err) throw err;
      db.close();
      res.render('index',{data:find_result});
    });
  });
});

app.get('/credit_card_transactions', function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.credit_card_transactions_collection_name).find({}).toArray(function(err, find_result){
      if (err) throw err;
      db.close();
      res.render('transactions',{data:find_result});
    });
  });
});

app.get('/bank_account_transactions', function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.bank_account_transactions_collection_name).find({}).toArray(function(err, find_result){
      if (err) throw err;
      db.close();
      res.render('transactions',{data:find_result});
    });
  });
});

// API to retrieve balance
app.get('/api', function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.balance_collection_name).find({}).sort({date: -1}).limit(1).toArray(function(err, find_result){
      if (err) throw err;
      db.close();
      res.send(find_result[0].balance);
    });
  });
})

// Start server
http_server.listen(misc_config.app_port, function(){
  console.log(`listening on *:${misc_config.app_port}`);
});
