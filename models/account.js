/*
Currently unused
*/
const {Schema,model} = require("mongoose")

const transactionSchema = new Schema ({
  description: String,
  amount: Number,
  date: Date,
  business_expense: Boolean,
  currency: String,
})

// Balance can be kept track in an influxdb measurement named after the account id
const accountSchema = new Schema ({
  user_id: String,
  name: String,
  transactions: [transactionSchema],
})
