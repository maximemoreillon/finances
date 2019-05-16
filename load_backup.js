var fs = require('fs');
var parse = require('csv-parse');
var mongodb = require('mongodb');

const DB_config = require('./config/db_config');

var MongoClient = mongodb.MongoClient;


var csvData=[];

var entries = [];

var first_row_ignored = false;


console.log("This script has been run already")
/*
fs.createReadStream("./balance_backup_2019_04_23.csv")
  .pipe(parse({delimiter: ','}))
  .on('data', function(csvrow) {

    if(first_row_ignored){
      var entry_year = csvrow[14];
      var entry_month = csvrow[15];
      var entry_day = csvrow[16];

      var entry = {};
      entry.date = new Date(String(entry_year) + "/" + String(entry_month) + "/"+ String(entry_day))
      entry.balance = csvrow[18]
      entries.push(entry);
    }
    else {
      first_row_ignored = true;
    }
  })
  .on('end',function() {
    MongoClient.connect(DB_config.DB_URL, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DB_config.DB_name);
      dbo.collection(DB_config.collection_name).insertMany(entries, function(err, res) {
        if (err) throw err;
        console.log("Number of documents inserted: " + res.insertedCount);
        db.close();
      });
    });
  });
*/
