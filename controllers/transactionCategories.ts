import { Request, Response } from "express"
import createHttpError from "http-errors"
import { pool } from "../db"

export const addCategoryToStransaction = async (
  req: Request,
  res: Response
) => {
  const { transaction_id } = req.params
  const { category_id } = req.body
  if (!category_id) throw createHttpError(400, `Missing category_id`)
  const sql = `
    INSERT INTO transaction_category(transaction_id, category_id) 
    VALUES($1, $2) 
    RETURNING *`

  const {
    rows: [id],
  } = await pool.query(sql, [transaction_id, category_id])

  res.send({ id })
}

export const readTransactionCategories = async (
  req: Request,
  res: Response
) => {
  const { transaction_id } = req.params
  const sql = `
    SELECT * FROM 
    transaction_category 
    WHERE transaction_id=$1`

  const { rows } = await pool.query(sql, [transaction_id])

  res.send({ categories: rows })
}

export const removeCategoryFromtransaction = async (
  req: Request,
  res: Response
) => {
  const { transaction_id, category_id } = req.params
  const sql = `
    DELETE FROM transaction_category 
    WHERE transaction_id=$1 AND category_id=$2`

  await pool.query(sql, [transaction_id, category_id])

  res.send({ transaction_id, category_id })
}
