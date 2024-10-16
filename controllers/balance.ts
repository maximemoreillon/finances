import createHttpError from "http-errors"
import { Request, Response } from "express"
import { pool } from "../db"

export const registerBalance = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const { time = new Date(), balance } = req.body

  if (!balance) throw createHttpError(400, `Missing balance`)

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

// TODO: Delete balance record
