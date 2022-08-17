const TransactionCategory = require('../models/transaction_category')

exports.get_categories = async (req,res,next) => {
  // Route to get all transaction categories

  try {
    const categories = await TransactionCategory
      .find({})

    res.send(categories)
  }
  catch (error) {
    next(error)
  }


}

exports.create_category = async (req,res, next) => {

  try {
    const category = await TransactionCategory.create(req.body)
    res.send(category)
  }
  catch (error) {
    next(error)
  }

  

}

exports.get_category = async (req,res, next) => {
  // Route to get all transaction categories

  try {
    const { category_id } = req.params

    const properties = req.body

    const category = await TransactionCategory.findById(category_id)
    console.log(`Transaction category ${category_id} queried`)
    res.send(category)
  }
  catch (error) {
    next(error)
  }

}


exports.update_category = async (req,res, next) => {

  try {
    const { category_id } = req.params

    const properties = req.body

    const result = await TransactionCategory.findByIdAndUpdate(category_id, properties)
    console.log(`Transaction category ${category_id} updated`)
    res.send(result)
  }
  catch (error) {
    next(error)
  }



}

exports.delete_category = async (req,res, next) => {

  try {
    const { category_id } = req.params

    const result = await TransactionCategory.findByIdAndDelete(category_id)
    console.log(`Transaction category ${category_id} deleted`)
    res.send(result)
  }
  catch (error) {
    next(error)
  }


}
