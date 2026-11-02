import createHttpError from "http-errors"
import { Request, Response } from "express"
import { pool } from "../db"
import {
  deleteBalanceQuerySchema,
  parseBody,
  registerBalanceSchema,
} from "../validation"

export const registerBalance = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const { time = new Date(), balance } = parseBody(
    registerBalanceSchema,
    req.body
  )

  const sql = `
    INSERT INTO balance(account_id, time, balance) 
    VALUES($1, $2, $3)
    RETURNING *
  `
  const {
    rows: [newBalance],
  } = await pool.query(sql, [account_id, time, balance])

  res.send(newBalance)
}

export const readBalance = async (req: Request, res: Response) => {
  const { account_id } = req.params
  if (!account_id) throw createHttpError(400, `Missing account id`)

  const { from = new Date(0), to = new Date(), limit = "5000" } = req.query

  const sql = `
    SELECT * FROM balance 
    WHERE account_id=$1
      AND time BETWEEN $2 AND $3
    ORDER BY time DESC
    LIMIT $4
    `
  const { rows } = await pool.query(sql, [account_id, from, to, Number(limit)])
  res.send({ from, to, limit: Number(limit), records: rows })
}

export const deleteBalance = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const { time } = parseBody(deleteBalanceQuerySchema, req.query)

  // Balance rows have no id: (account_id, time) identifies a record.
  // Truncated to milliseconds because times are read back as JS Dates
  const sql = `
    DELETE FROM balance
    WHERE account_id=$1
      AND date_trunc('milliseconds', time) = date_trunc('milliseconds', $2::timestamptz)
    RETURNING *
  `
  const { rows } = await pool.query(sql, [account_id, time])
  if (!rows.length) throw createHttpError(404, `Balance record not found`)

  res.send(rows)
}
