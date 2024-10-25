import createHttpError from "http-errors"
import { Request, Response } from "express"
import { pool } from "../db"
import { addCategoriesToTransaction } from "../utils"

// Exported so as to be used in tools/dataImport.ts
export async function registerSingleTransaction({
  time,
  account_id,
  amount,
  description,
}: any) {
  if (!account_id) throw createHttpError(400, `Missing account id`)
  if (!amount) throw createHttpError(400, `Missing amount`)
  if (!description) throw createHttpError(400, `Missing description`)

  const {
    rows: [newTransaction],
  } = await pool.query(
    `
      INSERT INTO transaction(account_id, time, amount, description) 
      VALUES($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
      RETURNING *
      `,
    [account_id, time, amount, description]
  )

  if (newTransaction) await addCategoriesToTransaction(newTransaction)

  return newTransaction
}

export const registerTransaction = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const { time = new Date(), amount, description } = req.body

  const newTransaction = await registerSingleTransaction({
    account_id,
    time,
    amount,
    description,
  })

  if (newTransaction) res.send(newTransaction)
  // TODO: find better way
  else res.send({ account_id, time, amount, description })
}

export const readTransactions = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const {
    from = new Date(0),
    to = new Date(),
    limit = "10000",
    offset = "0",
  } = req.query

  const categoryId = req.params.category_id ?? req.query.category

  const { rows: transactions } = await pool.query(
    `
    SELECT time, transaction.id AS id, description, amount, account_id
    FROM transaction 
    LEFT JOIN transaction_category ON transaction_category.transaction_id=transaction.id
    WHERE time BETWEEN $1 AND $2
      AND ($5::int IS NULL OR account_id=$5) 
      AND ($6::int IS NULL OR transaction_category.category_id=$6) 
    GROUP BY transaction.id
    ORDER BY time DESC
    LIMIT $3
    OFFSET $4
    `,
    [from, to, limit, offset, account_id, categoryId]
  )

  // Querying categories
  // TODO: try to achieve in a single SQL query

  const { rows: transactionCategories } = await pool.query(
    `
    SELECT category.name AS categoryname, category_id, transaction_id
    FROM transaction_category
    INNER JOIN category ON category.id=transaction_category.category_id
    `,
    []
  )

  const records = transactions.map((t) => ({
    ...t,
    categories: transactionCategories
      .filter((tc) => tc.transaction_id === t.id)
      .map((tc) => ({ id: tc.category_id, name: tc.categoryname })),
  }))

  res.send({ limit: Number(limit), to, from, offset: Number(offset), records })
}

export const readTransaction = async (req: Request, res: Response) => {
  const { transaction_id } = req.params
  if (!transaction_id) throw createHttpError(400, `Missing transaction id`)
  const {
    rows: [transaction],
  } = await pool.query("SELECT * FROM transaction WHERE id=$1", [
    transaction_id,
  ])

  const { rows: categories } = await pool.query(
    `SELECT category.name, category.id FROM transaction_category 
    INNER JOIN category ON transaction_category.category_id=category.id
    WHERE transaction_id=$1
      `,
    [transaction_id]
  )
  res.send({ ...transaction, categories })
}

export const update_transaction = async (req: Request, res: Response) => {
  const { transaction_id } = req.params
  if (!transaction_id) throw createHttpError(400, `Missing transaction id`)

  const { description, amount, time } = req.body
  if (!description) throw createHttpError(400, `Missing description`)
  if (!amount) throw createHttpError(400, `Missing amount`)
  if (!time) throw createHttpError(400, `Missing time`)

  const sql = `
    UPDATE transaction
    SET description=$2, amount=$3, time=$4
    WHERE id=$1
    RETURNING *`

  const {
    rows: [category],
  } = await pool.query(sql, [transaction_id, description, amount, time])

  res.send(category)
}

export const delete_transaction = async (req: Request, res: Response) => {
  const { transaction_id } = req.params
  if (!transaction_id) throw createHttpError(400, `Missing transaction id`)
  const sql = "DELETE FROM transaction WHERE id=$1"
  await pool.query(sql, [transaction_id])

  res.send({ id: transaction_id })
}
