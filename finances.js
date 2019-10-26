// NPM modules
const mongodb = require('mongodb');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieSession = require('cookie-session')
const cors = require('cors')

// Custom modules
const credentials = require('../common/credentials');
const misc = require('../common/misc');

const port = 8086;
const DB_config = require('./config/db_config');

// Set timezone
process.env.TZ = 'Asia/Tokyo';

// Instanciate objects
var ObjectID = mongodb.ObjectID;
var MongoClient = mongodb.MongoClient;
var app = express();
var http_server = http.Server(app);

// Express configuration
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieSession({
  name: 'session',
  secret: credentials.session_secret,
  maxAge: 253402300000000,
}));
app.use(cors({
  origin: misc.cors_origins,
  credentials: true,
}));

// Express routes
function checkAuth(req, res, next) {

  if (!req.session.user_id) res.redirect('/login');
  else next();
}

app.get('/login', function(req, res) {
  res.render('login.ejs');
});

app.post('/login', function (req, res) {
  var post = req.body;
  if (post.user === credentials.app_username && post.password === credentials.app_password) {
    // FOR NOW ONLY ONE USER
    req.session.user_id = 1;
    res.redirect('/');
  }
  else res.render('login.ejs', {error_message: "Wrong username/password"} );
});

app.get('/logout', function (req, res) {
  delete req.session.user_id;
  res.redirect('/');
});

// NEW API routes
app.post('/get_balance_history',checkAuth, function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.balance_collection_name).find({}).toArray(function(err, find_result){
      if (err) throw err;
      db.close();
      res.send(find_result);
    });
  });
});

app.post('/get_current_balance',checkAuth, function(req, res) {
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


app.post('/credit_card_transactions',checkAuth, function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.credit_card_transactions_collection_name).find({}).toArray(function(err, find_result){
      if (err) throw err;
      db.close();
      res.send(find_result);
    });
  });
});

app.post('/bank_account_transactions',checkAuth, function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.bank_account_transactions_collection_name).find({}).toArray(function(err, find_result){
      if (err) throw err;
      db.close();
      res.send(find_result);
    });
  });
});


// DEV ROUTES
app.get('/delete_invalid_balance_entries',checkAuth, function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    var query = { balance: null };
    dbo.collection(DB_config.balance_collection_name).deleteMany(query, function(err, result) {
      if (err) throw err;
      db.close();
      res.send(result);
    });
  });
});

// LEGACY API routes
app.get('/balance_history',checkAuth, function(req, res) {
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

app.get('/credit_card_transactions',checkAuth, function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.credit_card_transactions_collection_name).find({}).toArray(function(err, find_result){
      if (err) throw err;
      db.close();
      res.render('transactions',{data:find_result, update_url: "/update_credit_card_transaction"});
    });
  });
});

app.post('/update_credit_card_transaction',checkAuth, function(req, res) {
  if(req.body._id && req.body.properties){
    MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DB_config.DB_name);
      var query = {_id: ObjectID(req.body._id)};
      var properties = {$set: req.body.properties};

      dbo.collection(DB_config.credit_card_transactions_collection_name).updateOne(query, properties, function(err, update_result){
        if (err) throw err;
        db.close();
        res.send("OK");
      });
    });
  }
  else{
    res.sendStatus(400);
    res.send("NG");
  }
});

app.get('/bank_account_transactions',checkAuth, function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.bank_account_transactions_collection_name).find({}).toArray(function(err, find_result){
      if (err) throw err;
      db.close();
      res.render('transactions',{data:find_result, update_url: "/update_bank_account_transaction"});
    });
  });
});

app.post('/update_bank_account_transaction',checkAuth, function(req, res) {
  if(req.body._id && req.body.properties){
    MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DB_config.DB_name);
      var query = {_id: ObjectID(req.body._id)};
      var properties = {$set: req.body.properties};

      dbo.collection(DB_config.bank_account_transactions_collection_name).updateOne(query, properties, function(err, update_result){
        if (err) throw err;
        db.close();
        res.send("OK");
      });
    });
  }
  else{
    res.sendStatus(400);
    res.send("NG");
  }
});


app.get('/transactions',checkAuth, function(req, res) {
  MongoClient.connect(DB_config.DB_URL, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_config.DB_name);
    dbo.collection(DB_config.credit_card_transactions_collection_name).find({}).toArray(function(err, credit_find_result){
      if (err) throw err;
      // No need to put credit card transactions again
      var query = {description: {$ne: '振替　ﾄﾖﾀﾌｱｲﾅﾝｽ (ｶ'}}
      dbo.collection(DB_config.bank_account_transactions_collection_name).find(query).toArray(function(err, brank_find_result){
        if (err) throw err;
        db.close();
        res.render('transactions',{data:credit_find_result.concat(brank_find_result), update_url: "/update_bank_account_transaction"});
      });
    });
  });
});

// API to retrieve balance
// Add password here
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
http_server.listen(port, function(){
  console.log(`Finances manager listening on *:${port}`);
});
