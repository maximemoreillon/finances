import { pool } from "../db"

async function main() {
  try {
    await pool.query(`DROP TABLE balance`)
    await pool.query(`DROP TABLE keyword`)
    await pool.query(`DROP TABLE transaction_category`)
    await pool.query(`DROP TABLE category`)
    await pool.query(`DROP TABLE transaction`)
    await pool.query(`DROP TABLE account`)
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    console.log("Finished")
    await pool.end()
  }
}

main()
