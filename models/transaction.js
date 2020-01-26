const mongoose = require("mongoose");

var TransactionSchema = new mongoose.Schema({
  account: String,
  description: String,
  amount: Number,
  date: Date,
  business_expense: Boolean,
  currency: String,
});

var Transaction= mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction
