const TransactionCategory = require('../models/transaction_category')

exports.get_categories = (req,res) => {
  // Route to get all transaction categories


  TransactionCategory
    .find({})
    .exec((err, docs) => {

      // Error handling
      if (err) {
        console.log(err)
        res.status(500).send(`Error retrieving transaction categories`)
        return
      }

      res.send(docs)

      console.log(`Transactions categories`)
    })
}

exports.create_category = (req,res) => {

  const category = new TransactionCategory(req.body)

  category.save()
  .then((result) => {
    console.log(`Category created`)
    res.send(result)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error creating category`)
  })
}

exports.get_category = (req,res) => {
  // Route to get all transaction categories

  let category_id = req.params.transaction_category_id
    || req.params.category_id
    || req.query.transaction_category_id
    || req.query.category_id
    || req.query.id
    || req.query._id

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
