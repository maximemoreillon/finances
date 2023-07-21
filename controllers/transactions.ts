import Transaction from "../models/transaction"
import createHttpError from "http-errors"

export const get_transactions = async (req, res) => {
  // Route to get all transactions of a given account

  // Once routing has been cleaned up, only req.params.account should be used

  const { account } = req.params
  if (!account) throw createHttpError(400, "Missing acount")

  const transactions = await Transaction.find({ account })
    .sort({ date: -1 })
    .populate("category")

  console.log(`Transactions of account ${account} queried`)
  res.send(transactions)
}

export const get_transaction = async (req, res) => {
  // Route to get a single transaction, regardless of account

  const { transaction_id } = req.params

  if (!transaction_id) throw createHttpError(400, "Missing transaction_id")

  const transaction = await Transaction.findById(transaction_id)
  console.log(`Transaction ${transaction_id} queried`)

  res.send(transaction)
}

export const update_transaction = async (req, res) => {
  // Route to update a single transaction, identified using its ID

  const { transaction_id } = req.params

  if (!transaction_id) throw createHttpError(400, "Missing transaction_id")

  const result = await Transaction.findByIdAndUpdate(transaction_id, req.body, {
    new: true,
  })
  console.log(`Transaction ${transaction_id} updated`)

  res.send(result)
}

export const delete_transaction = async (req, res) => {
  const { transaction_id } = req.params

  if (!transaction_id) throw createHttpError(400, "Missing transaction_id")

  const result = await Transaction.findByIdAndDelete(transaction_id)

  res.send(result)
}

export const register_transactions = async (req, res) => {
  // Route to register multiple transactions

  const { account } = req.params
  const { transactions } = req.body

  if (!transactions) throw createHttpError(400, "Missing transactions")

  // Create a list of operations
  const bulk_operations = transactions.map((transaction) => ({
    updateOne: {
      filter: { account, ...transaction },
      update: { account, ...transaction },
      upsert: true,
    },
  }))

  const bulkWriteOpResult = await Transaction.bulkWrite(bulk_operations)
  console.log(
    `${transactions.length} Transactions registered for account ${account}`
  )
  res.send(bulkWriteOpResult)
}

const get_accounts_with_transactions = () =>
  Transaction.find().distinct("account")
export const get_accounts_with_transactions = get_accounts_with_transactions

export const get_accounts = async (req, res) => {
  const accounts = await get_accounts_with_transactions()
  res.send(accounts)
}
