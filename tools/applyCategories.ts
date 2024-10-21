// NOTE: This can now be done with PATCH /categories

import { pool } from "../db"

async function main() {
  pool.connect()

  try {
    const { rows: transactions } = await pool.query(
      `SELECT id, description FROM transaction`
    )

    const { rows: keywords } = await pool.query(
      `SELECT word, category_id FROM keyword`
    )

    for (const { description, id: transaction_id } of transactions) {
      const matchingCategories = keywords.filter(({ word }) =>
        description.includes(word)
      )

      for (const { category_id } of matchingCategories) {
        await pool.query(
          `
            INSERT INTO transaction_category(transaction_id, category_id) 
            VALUES($1, $2) 
            ON CONFLICT DO NOTHING`,
          [transaction_id, category_id]
        )
        console.log(`Transaction ${transaction_id} -> category ${category_id}`)
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    console.log("Finished")
    pool.end()
  }
}

main()
