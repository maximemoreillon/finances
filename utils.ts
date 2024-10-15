import { pool } from "./db"

export async function addCategoriesToTransaction({ description, id }: any) {
  const { rows: keywords } = await pool.query("SELECT * FROM keyword", [])

  const matchingKeywords = keywords.filter(({ word }) =>
    description.includes(word)
  )

  for (const keyword of matchingKeywords) {
    await pool.query(
      `INSERT INTO transaction_category(transaction_id, category_id)
      VALUES($1, $2)`,
      [id, keyword.category_id]
    )
  }
}
