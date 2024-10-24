import { Request, Response } from "express"
import createHttpError from "http-errors"
import { pool } from "../db"

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body

  if (!name) throw createHttpError(400, `Missing name`)

  const sql = `
    INSERT INTO category(name) 
    VALUES($1) 
    RETURNING *`

  const {
    rows: [category],
  } = await pool.query(sql, [name])

  res.send(category)
}

export const readCategories = async (req: Request, res: Response) => {
  const { rows } = await pool.query(`
    SELECT category.id, category.name, COUNT(transaction_category.category_id) as transaction_count
    FROM category
    LEFT JOIN transaction_category ON transaction_category.category_id=category.id
    GROUP BY category.id
    `)

  // Adding keywords
  // TODO: achieve this with a single SQL query
  const { rows: keywords } = await pool.query(`SELECT * FROM keyword`)
  const categories = rows.map((c) => ({
    ...c,
    keywords: keywords.filter((k) => k.category_id === c.id),
  }))

  res.send({ categories })
}

export const readCategory = async (req: Request, res: Response) => {
  const { category_id } = req.params
  const {
    rows: [category],
  } = await pool.query("SELECT * FROM category WHERE id=$1", [category_id])

  // TODO: see if this can be achieved with a single query
  const { rows: keywords } = await pool.query(
    "SELECT id, word FROM keyword WHERE category_id=$1",
    [category_id]
  )

  res.send({ ...category, keywords })
}

export const updateCategory = async (req: Request, res: Response) => {
  const { category_id } = req.params
  const { name } = req.body

  if (!name) throw createHttpError(400, `Missing name`)

  const sql = `
    UPDATE category
    SET name=$2
    WHERE id=$1
    RETURNING *`

  const {
    rows: [category],
  } = await pool.query(sql, [category_id, name])

  res.send(category)
}

export const deleteCategory = async (req: Request, res: Response) => {
  const { category_id } = req.params
  const sql = "DELETE FROM category WHERE id=$1"
  await pool.query(sql, [category_id])

  res.send({ id: category_id })
}

export const applyCategories = async (req: Request, res: Response) => {
  // TODO: do that as a single SQL query
  const { rows: transactions } = await pool.query(
    `SELECT id, description FROM transaction`
  )

  const { rows: keywords } = await pool.query(
    `SELECT word, category_id FROM keyword`
  )

  let categoriesAdded = 0

  for (const { description, id: transaction_id } of transactions) {
    const matchingCategories = keywords.filter(({ word }) =>
      description.includes(word)
    )

    for (const { category_id } of matchingCategories) {
      const {
        rows: [affectedTransaction],
      } = await pool.query(
        `
            INSERT INTO transaction_category(transaction_id, category_id) 
            VALUES($1, $2) 
            ON CONFLICT DO NOTHING
            RETURNING *`,
        [transaction_id, category_id]
      )

      if (affectedTransaction) categoriesAdded++
    }
  }

  res.send({ categoriesAdded })
}
