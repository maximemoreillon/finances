// Currently unused

import { Schema, model } from "mongoose"

// TODO: to be merged with existing schema
const transactionSchema = new Schema({
  description: String,
  amount: Number,
  date: Date,
  business_expense: Boolean,
  currency: String,
})

// Balance can be kept track in an influxdb measurement named after the account id
const accountSchema = new Schema({
  user_id: String,
  name: String,
  transactions: [transactionSchema],
})

export default model("Account", accountSchema)
