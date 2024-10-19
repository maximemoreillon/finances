import createHttpError from "http-errors"

import { Request, Response } from "express"
import { pool } from "../db"

export const createAccount = async (req: Request, res: Response) => {
  const { name, currency } = req.body

  if (!name) throw createHttpError(400, `Missing name`)
  if (!currency) throw createHttpError(400, `Missing currency`)

  const sql = `
    INSERT INTO account(name, currency) 
    VALUES($1, $2) 
    RETURNING *`

  const {
    rows: [account],
  } = await pool.query(sql, [name, currency])

  res.send(account)
}

export const readAccounts = async (req: Request, res: Response) => {
  const sql = `
    SELECT id, name, currency, balance, transaction_count
    FROM account 

    --- Adding latest balance
    LEFT JOIN (
      SELECT balance, balance.account_id
      FROM balance
      INNER JOIN (
          SELECT account_id, max(time) AS max_time
          FROM balance
          GROUP BY balance.account_id
      ) temp ON balance.account_id = temp.account_id AND balance.time = temp.max_time
      RIGHT JOIN account ON balance.account_id=account.id
    ) xxx ON account_id = account.id
    --- Adding transaction count

    LEFT JOIN (
      SELECT account_id, count(id) AS transaction_count
      FROM transaction
      GROUP BY account_id
    ) transaction_temp ON account.id = transaction_temp.account_id
    `
  const { rows } = await pool.query(sql)

  res.send({ accounts: rows })
}

export const readAccount = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const sql = `
    SELECT * 
    FROM account WHERE id=$1
    `
  const {
    rows: [account],
  } = await pool.query(sql, [account_id])

  res.send(account)
}

export const deleteAccount = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const sql = "DELETE FROM account WHERE id=$1"
  await pool.query(sql, [account_id])

  res.send({ id: account_id })
}
