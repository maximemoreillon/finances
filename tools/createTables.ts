import { pool } from "../db"

async function main() {
  pool.connect()

  try {
    console.log(`Creating table account`)
    await pool.query(`CREATE TABLE IF NOT EXISTS account (
      id SERIAL PRIMARY KEY,
      currency VARCHAR(50),
      name VARCHAR(50)
    );`)

    // Transactions
    // NOTE: Not hypertable
    console.log(`Creating table transaction`)
    await pool.query(`CREATE TABLE IF NOT EXISTS transaction (
      time TIMESTAMPTZ NOT NULL,
      id SERIAL PRIMARY KEY,
      account_id INTEGER,
      description VARCHAR(50),
      amount DOUBLE PRECISION,
      FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE,
      UNIQUE(time, description, amount, account_id)
    );`)

    // Balance hypertable
    console.log(`Creating table balance`)
    await pool.query(`CREATE TABLE IF NOT EXISTS balance (
      time TIMESTAMPTZ NOT NULL,
      account_id INTEGER,
      balance DOUBLE PRECISION,
      FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE
      );`)

    try {
      await pool.query("SELECT create_hypertable('balance', by_range('time'));")
    } catch (error: any) {
      if (error.code !== "TS110") throw error
    }

    // Transaction categories
    console.log(`Creating table category`)
    await pool.query(`CREATE TABLE IF NOT EXISTS category (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50),
      UNIQUE(name)
      );`)

    console.log(`Creating table transaction_category`)
    await pool.query(`CREATE TABLE IF NOT EXISTS transaction_category (
      id SERIAL PRIMARY KEY,
      transaction_id INTEGER,
      category_id INTEGER,

      CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transaction (id) ON DELETE CASCADE,
      CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE,

      UNIQUE(transaction_id, category_id)

      );`)

    console.log(`Creating table keyword`)
    await pool.query(`CREATE TABLE IF NOT EXISTS keyword (
      id SERIAL PRIMARY KEY,
      word VARCHAR(50),
      category_id INTEGER,
      CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
      )`)
  } catch (error) {
    console.error(error)
  } finally {
    console.log("Finished")
    pool.end()
  }
}

main()
