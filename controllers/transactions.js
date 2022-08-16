const Transaction = require('../models/transaction')
const createHttpError = require('http-errors')

exports.get_transactions = async (req, res, next) => {
  // Route to get all transactions of a given account

  // Once routing has been cleaned up, only req.params.account should be used

  try {
    const {account} =  req.params
    if (!account) throw createHttpError(400, 'Missing acount')

    const transactions = await Transaction
      .find({ account })
      .sort({ date: -1 })
    
    console.log(`Transactions of account ${account} queried`)
    res.send(transactions)

  }
  catch (error) {
    next(error)
  }

}

exports.get_transaction = async (req, res, next) => {
  // Route to get a single transaction, regardless of account

  try {
    const { transaction_id } = req.params

    if (!transaction_id) throw createHttpError(400, 'Missing transaction_id')

    const transaction = await Transaction.findById(transaction_id)
    console.log(`Transaction ${transaction_id} queried`)

    res.send(transaction)
  }


  catch (error) {
    next(error)
  }


}

exports.update_transaction = async (req, res, next) => {
  // Route to update a sing transaction, identified using its ID

  try {
    const { transaction_id } = req.params

    if (!transaction_id) throw createHttpError(400, 'Missing transaction_id')

    const result = Transaction.findByIdAndUpdate(transaction_id, req.body, { new: true })
    console.log(`Transaction ${transaction_id} updated`)

    res.send(result)
  }
  

  catch (error) {
    next(error)
  }

}

exports.delete_transaction = async (req, res, next) => {

  try {
    const { transaction_id } = req.params

    if (!transaction_id) throw createHttpError(400, 'Missing transaction_id')

    const result = await Transaction.findByIdAndDelete(transaction_id)

    res.send(result)

  }
  catch (error) {
    next(error)
  }


}

exports.register_transactions = async (req, res, next) => {
  // Route to register multiple transactions

  try {
    const { account } = req.params
    const { transactions } = req.body

    if (!transactions) throw createHttpError(400, 'Missing transactions')

    // Create a list of operations
    const bulk_operations = transactions.map( transaction => ({
      updateOne: {
        filter: { account, ...transaction },
        update: { account, ...transaction },
        upsert: true
      }
    }))


    const bulkWriteOpResult = await Transaction.bulkWrite(bulk_operations)
    console.log(`${transactions.length} Transactions registered for account ${account}`)
    res.send(bulkWriteOpResult)
  }
  catch (error) {
    next(error)
  }




}

const get_accounts_with_transactions = () => Transaction.find().distinct('account')
exports.get_accounts_with_transactions = get_accounts_with_transactions

exports.get_accounts = async (req,res, next) => {
  // Get a list of all accounts
  try {
    const accounts = await get_accounts_with_transactions()
    res.send(accounts)
  }
  catch (e) {
    next(e)
  }


}
