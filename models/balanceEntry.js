const mongoose = require("mongoose");

var BalanceEntrySchema = new mongoose.Schema({
  balance: String,
  date: Date,
  account: String,
});

var BalanceEntry= mongoose.model('Transaction', BalanceEntrySchema);

module.exports = BalanceEntry
