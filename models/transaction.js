const mongoose = require("mongoose");

var TransactionSchema = new mongoose.Schema({
  Account: String,
  Description: String,
  Amount: Number,
  date: Date,
});

var Transaction= mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction
