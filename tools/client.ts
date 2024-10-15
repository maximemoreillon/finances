import { Client } from "pg"
import dotenv from "dotenv"
dotenv.config()

export const client = new Client()

export async function connect() {
  await client.connect()
}
