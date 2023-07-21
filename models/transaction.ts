import { Schema, model } from "mongoose"

const TransactionSchema = new Schema({
  account: String,
  description: String,
  amount: Number,
  date: Date,
  business_expense: Boolean,
  currency: String,

  category: {
    type: Schema.Types.ObjectId,
    ref: "TransactionCategory",
  },
})

export default model("Transaction", TransactionSchema)
