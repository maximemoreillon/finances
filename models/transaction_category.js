const {Schema,model} = require("mongoose");

const schema = new Schema({
  label: String,
  keywords: Array,
})

var TransactionCategory = model('TransactionCategory', schema)

module.exports = TransactionCategory
