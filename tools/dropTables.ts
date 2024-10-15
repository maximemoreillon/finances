import { client, connect } from "./client"

async function main() {
  connect()

  try {
    // await client.query(`DROP TABLE balance`)
    await client.query(`DROP TABLE keyword`)
    await client.query(`DROP TABLE transaction_category`)
    await client.query(`DROP TABLE category`)
    await client.query(`DROP TABLE transaction`)
    // await client.query(`DROP TABLE account`)
  } catch (error) {
    console.error(error)
  } finally {
    console.log("Finished")
    client.end()
  }
}

main()
