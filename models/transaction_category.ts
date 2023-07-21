import { Schema, model } from "mongoose"

const schema = new Schema({
  label: String,
  keywords: Array,
})

export default model("TransactionCategory", schema)
