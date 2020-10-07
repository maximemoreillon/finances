const Transaction = require('../models/transaction')

exports.get_transactions = (req,res) => {
  // Route to get all transactions of a certain account

  let account = req.query.account
    || req.query.account_name
    || req.params.account
    || req.params.account_name

  if(!account) return res.status(400).send(`Missing account name`)

  Transaction
    .find({account: account})
    .sort({date: -1})
    .exec((err, docs) => {

      // Error handling
      if (err) {
        console.log(err)
        res.status(500).send(`Error retrieving transactions of account ${account}`)
        return
      }

      res.send(docs)

      console.log(`Transactions of account ${account} queried`)
    })
}

exports.get_transaction = (req,res) => {
  // Route to get a single transaction

  let transaction_id = req.params.transaction_id
    || req.query._id

  Transaction.findById(transaction_id, (err, transaction) => {
    // Error handling
    if (err) {
      console.log(message)
      res.status(500).send(`Error retrieving transaction ${transaction_id}`)
      return
    }

    res.send(transaction)

    console.log(`Transaction ${transaction_id} queried`)
  })
}

exports.update_transaction = (req,res) => {
  // Route to update a transaction

  let transaction_id = req.params.transaction_id
    || req.query._id

  Transaction.findByIdAndUpdate(transaction_id, req.body, {new: true}, (err, transaction) => {
    // Error handling
    if (err) {
      console.log(err)
      res.status(500).send(`Error updating transaction ${transaction_id}`)
      return
    }

    res.send(transaction)
    console.log(`Transaction ${transaction_id} updated`)
  })
}

exports.delete_transaction = (req,res) => {
  // Route to delete a transaction

  let transaction_id = req.params.transaction_id
    || req.query._id

  Transaction.findByIdAndDelete(transaction_id, (err, transaction) => {

    if (err) {
      console.log(err)
      res.status(500).send(`Error deleting transaction ${transaction_id} `)
      return
    }

    res.send('OK')

    console.log(`Transaction ${transaction_id} deleted`)
  })
}

exports.register_transactions = (req,res) => {
  // Route to register multiple transactions
  let bulk_operations = []
  for (var transaction of req.body.transactions) {
    bulk_operations.push({
      updateOne: {
        filter: transaction,
        update: transaction,
        upsert: true
      }
    })
  }

  Transaction.bulkWrite(bulk_operations)
  .then( (bulkWriteOpResult) => {
    res.send('OK')
    console.log(`Transactions registered`)
  })
  .catch( (err) => {
    console.log(err)
    res.status(500).send("Error writing to DB")
  })

}

exports.get_accounts = (req,res) => {
  // Route to get a single transaction
  Transaction.find().distinct('account', (err, transaction) => {
    if (err) {
      console.log(err)
      res.status(500).send(`Error getting accounts`)
      return
    }
    res.send(transaction)
  })
}
