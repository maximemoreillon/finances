import { client, connect } from "./client"

async function main() {
  connect()

  try {
    await client.query(`CREATE TABLE IF NOT EXISTS account (
      id SERIAL PRIMARY KEY,
      currency VARCHAR(50),
      name VARCHAR(50)
    );`)

    // Transactions
    // NOTE: Not hypertable
    await client.query(`CREATE TABLE IF NOT EXISTS transaction (
      time TIMESTAMPTZ NOT NULL,
      id SERIAL PRIMARY KEY,
      account_id INTEGER,
      description VARCHAR(50),
      amount DOUBLE PRECISION,
      FOREIGN KEY (account_id) REFERENCES account (id),
      UNIQUE(time, description, amount, account_id)
    );`)

    // Balance hypertable
    await client.query(`CREATE TABLE IF NOT EXISTS balance (
      time TIMESTAMPTZ NOT NULL,
      account_id INTEGER,
      balance DOUBLE PRECISION,
      FOREIGN KEY (account_id) REFERENCES account (id)
      );`)

    try {
      await client.query(
        "SELECT create_hypertable('balance', by_range('time'));"
      )
    } catch (error: any) {
      if (error.code !== "TS110") throw error
    }

    // Transaction categories
    await client.query(`CREATE TABLE IF NOT EXISTS category (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50)
      );`)

    await client.query(`CREATE TABLE IF NOT EXISTS transaction_category (
      id SERIAL PRIMARY KEY,
      transaction_id INTEGER,
      category_id INTEGER,

      CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transaction (id) ON DELETE CASCADE,
      CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE,

      UNIQUE(transaction_id, category_id)

      );`)

    await client.query(`CREATE TABLE IF NOT EXISTS keyword (
      id SERIAL PRIMARY KEY,
      word VARCHAR(50),
      category_id INTEGER,
      CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
      )`)
  } catch (error) {
    console.error(error)
  } finally {
    console.log("Finished")
    client.end()
  }
}

main()
