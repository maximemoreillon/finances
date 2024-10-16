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

  // TODO: from and to optional
  const {
    // 12 months ago by default
    limit = "500",
  } = req.query

  // TODO: from and to optional
  // TODO: have account_id optional, if not provided then all accounts
  // In that case, add account name to transactions
  const { rows: transactions } = await pool.query(
    `
    SELECT * FROM transaction 
    ORDER BY time DESC
    LIMIT $4
    `,
    [account_id, limit]
  )

  // Querying categories
  // TODO: try to achieve in a single SQL query
  const { rows: keywords } = await pool.query(
    `
    SELECT word, name AS categoryname, category.id as categoryid
    FROM keyword
    INNER JOIN category ON category.id = keyword.category_id
    `,
    []
  )

  const records = transactions.map((t) => ({
    ...t,
    categories: keywords
      .filter((k) => t.description.includes(k.word))
      .map((k) => ({ id: k.categoryid, name: k.categoryname })),
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
