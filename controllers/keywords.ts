import { Request, Response } from "express"
import createHttpError from "http-errors"
import { pool } from "../db"

export const createKeyword = async (req: Request, res: Response) => {
  const { category_id } = req.params
  const { word } = req.body

  if (!word) throw createHttpError(400, `Missing word`)

  const sql = `INSERT INTO keyword(category_id, word) VALUES($1, $2) RETURNING *`

  const {
    rows: [keyword],
  } = await pool.query(sql, [Number(category_id), word])

  res.send(keyword)
}

export const readCategoryKeywords = async (req: Request, res: Response) => {
  const { category_id } = req.params

  const sql = "SELECT * FROM keyword WHERE category_id=$1"
  const { rows } = await pool.query(sql, [category_id])

  res.send({ keywords: rows })
}

// TODO: Update keyword

export const deleteKeyword = async (req: Request, res: Response) => {
  const { keyword_id } = req.params
  const sql = "DELETE FROM keyword WHERE id=$1"
  await pool.query(sql, [keyword_id])

  res.send({ id: keyword_id })
}
