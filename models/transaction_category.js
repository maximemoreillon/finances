const { Schema, model } = require("mongoose")

const schema = new Schema({
  label: String,
  keywords: Array,
})

module.exports = model("TransactionCategory", schema)
