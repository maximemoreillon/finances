import { pool } from "../db"

async function main() {
  pool.connect()

  try {
    // await pool.query(`DROP TABLE balance`)
    await pool.query(`DROP TABLE keyword`)
    await pool.query(`DROP TABLE transaction_category`)
    await pool.query(`DROP TABLE category`)
    await pool.query(`DROP TABLE transaction`)
    // await pool.query(`DROP TABLE account`)
  } catch (error) {
    console.error(error)
  } finally {
    console.log("Finished")
    pool.end()
  }
}

main()
