import { pool } from "./db"

export async function addCategoriesToTransaction(
  { description, id }: any,
  keywords?: any
) {
  // Allow for keywords query externally, i.e. only once when used in a for loop
  if (!keywords) {
    const { rows } = await pool.query("SELECT * FROM keyword", [])
    keywords = rows
  }

  const matchingKeywords = keywords.filter(({ word }: any) =>
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
