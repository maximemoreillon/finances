import { Request, Response } from "express"
import { pool } from "../db"
import { accountSchema, parseBody } from "../validation"

export const createAccount = async (req: Request, res: Response) => {
  const { name, currency, icon_url = null } = parseBody(accountSchema, req.body)

  const sql = `
    INSERT INTO account(name, currency, icon_url) 
    VALUES($1, $2, $3) 
    RETURNING *`

  const {
    rows: [account],
  } = await pool.query(sql, [name, currency, icon_url])

  res.send(account)
}

export const readAccounts = async (req: Request, res: Response) => {
  const sql = `
    SELECT id, name, currency, icon_url, balance, transaction_count
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

export const updateAccount = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const { name, currency, icon_url } = parseBody(accountSchema, req.body)

  // icon_url omitted: keep the current one, so clients unaware of icons don't wipe them
  const keepIcon = icon_url === undefined

  const sql = `
    UPDATE account
    SET name=$2, currency=$3, icon_url=CASE WHEN $4 THEN icon_url ELSE $5 END
    WHERE id=$1
    RETURNING *`

  const {
    rows: [account],
  } = await pool.query(sql, [account_id, name, currency, keepIcon, icon_url ?? null])

  res.send(account)
}

export const deleteAccount = async (req: Request, res: Response) => {
  const { account_id } = req.params
  const sql = "DELETE FROM account WHERE id=$1"
  await pool.query(sql, [account_id])

  res.send({ id: account_id })
}
