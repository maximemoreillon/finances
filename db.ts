import pg from "pg"
import dotenv from "dotenv"
dotenv.config()

export const {
  TIMESCALEDB_HOST = "localhost",
  TIMESCALEDB_PORT = "5432",
  TIMESCALEDB_USER = "postgres",
  TIMESCALEDB_PASSWORD = "",
  TIMESCALEDB_DATABASE = "finances",
} = process.env

export const pool = new pg.Pool({
  host: TIMESCALEDB_HOST,
  port: Number(TIMESCALEDB_PORT),
  database: TIMESCALEDB_DATABASE,
  user: TIMESCALEDB_USER,
  password: TIMESCALEDB_PASSWORD,
})
