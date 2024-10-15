import createHttpError from "http-errors"

import { Request, Response } from "express"
import { pool } from "../db"

export const createAccount = async (req: Request, res: Response) => {
  const { name, currency } = req.body

  if (!name) throw createHttpError(400, `Missing name`)
  if (!currency) throw createHttpError(400, `Missing currency`)

  const sql = `INSERT INTO account(name, currency) VALUES($1, $2) RETURNING *`

  const {
    rows: [account],
  } = await pool.query(sql, [name, currency])

  res.send(account)
}

export const readAccounts = async (req: Request, res: Response) => {
  const sql = "SELECT * FROM account"
  const { rows } = await pool.query(sql)

  res.send({ accounts: rows })
}

export const readAccount = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const sql = "SELECT * FROM account WHERE id=$1"
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
