const mongoose = require("mongoose");

var TransactionCategorySchema = new mongoose.Schema({
  label: String,
  keywords: Array,
})

var TransactionCategory = mongoose.model('TransactionCategory', TransactionCategorySchema)

module.exports = TransactionCategory
