const TransactionCategory = require("../models/transaction_category")

exports.get_categories = async (req, res) => {
  // Route to get all transaction categories

  const categories = await TransactionCategory.find({})

  res.send(categories)
}

exports.create_category = async (req, res) => {
  const category = await TransactionCategory.create(req.body)
  res.send(category)
}

exports.get_category = async (req, res) => {
  // Route to get all transaction categories

  const { category_id } = req.params

  const properties = req.body

  const category = await TransactionCategory.findById(category_id)
  console.log(`Transaction category ${category_id} queried`)
  res.send(category)
}

exports.update_category = async (req, res) => {
  const { category_id } = req.params

  const properties = req.body

  const result = await TransactionCategory.findByIdAndUpdate(
    category_id,
    properties
  )
  console.log(`Transaction category ${category_id} updated`)
  res.send(result)
}

exports.delete_category = async (req, res) => {
  const { category_id } = req.params

  const result = await TransactionCategory.findByIdAndDelete(category_id)
  console.log(`Transaction category ${category_id} deleted`)
  res.send(result)
}
