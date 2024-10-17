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

  const { from = new Date(0), to = new Date(), limit = "10000" } = req.query

  let transactions = []

  // TODO: There must be a nicer way
  if (account_id) {
    // TODO: inner join for account name and currency
    const { rows } = await pool.query(
      `
      SELECT * 
      FROM transaction 
      WHERE time BETWEEN $1 AND $2
        AND account_id=$4
      ORDER BY time DESC
      LIMIT $3
      `,
      [from, to, limit, account_id]
    )
    transactions = rows
  } else {
    const { rows } = await pool.query(
      `
      SELECT * 
      FROM transaction 
      WHERE time BETWEEN $1 AND $2
      ORDER BY time DESC
      LIMIT $3
      `,
      [from, to, limit]
    )
    transactions = rows
  }

  // Querying categories
  // TODO: try to achieve in a single SQL query

  const { rows: transactionCategories } = await pool.query(
    `
    SELECT category.name AS categoryname, category_id, transaction_id
    FROM transaction_category
    INNER JOIN category ON category.id = transaction_category.category_id
    `,
    []
  )

  const records = transactions.map((t) => ({
    ...t,
    categories: transactionCategories
      .filter((tc) => tc.transaction_id === t.id)
      .map((tc) => ({ id: tc.category_id, name: tc.categoryname })),
  }))

  res.send({ limit: Number(limit), records })
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
  res.status(500).send("WIP")
}

export const delete_transaction = async (req: Request, res: Response) => {
  const { transaction_id } = req.params
  if (!transaction_id) throw createHttpError(400, `Missing transaction id`)
  const sql = "DELETE FROM transaction WHERE id=$1"
  await pool.query(sql, [transaction_id])

  res.send({ id: transaction_id })
}
