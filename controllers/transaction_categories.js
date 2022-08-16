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

exports.create_category = async (req,res) => {

  try {
    const category = await TransactionCategory.create(req.body)
    res.send(category)
  }
  catch (error) {
    next(error)
  }

  

}

exports.get_category = (req,res) => {
  // Route to get all transaction categories

  const {category_id} = req.params

  TransactionCategory.findById(category_id, (err, category) => {
    // Error handling
    if (err) {
      console.log(message)
      res.status(500).send(`Error retrieving category ${category_id}`)
      return
    }

    res.send(category)

    console.log(`Transaction category ${category_id} queried`)
  })
}


exports.update_category = (req,res) => {
  // Route to update a transaction

  let category_id = req.params.transaction_category_id
    || req.params.category_id
    || req.query.transaction_category_id
    || req.query.category_id
    || req.query.id
    || req.query._id

  TransactionCategory.findByIdAndUpdate(category_id, req.body, {new: true}, (err, transaction) => {
    // Error handling
    if (err) {
      console.log(err)
      res.status(500).send(`Error updating category ${category_id}`)
      return
    }

    res.send(transaction)
    console.log(`Transaction category ${category_id} updated`)
  })
}

exports.delete_category = (req,res) => {
  // Route to delete a transaction

  let category_id = req.params.transaction_category_id
    || req.params.category_id
    || req.query.transaction_category_id
    || req.query.category_id
    || req.query.id
    || req.query._id

  TransactionCategory.findByIdAndDelete(category_id, (err, transaction) => {

    if (err) {
      console.log(err)
      res.status(500).send(`Error deleting category ${category_id} `)
      return
    }

    res.send('OK')

    console.log(`Transaction category ${category_id} deleted`)
  })
}
