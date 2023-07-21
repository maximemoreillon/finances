import express from "express"
import "express-async-errors"
import cors from "cors"
import auth from "@moreillon/express_identification_middleware"
import group_auth from "@moreillon/express_group_based_authorization_middleware"
import {
  connect as mongodb_connect,
  url as mongodb_url,
  db as mongodb_db,
} from "./mongodbs"
import { url as influxdb_url, db as influxdb_db } from "./influxdb"
import apiMetrics from "prometheus-api-metrics"
import dotenv from "dotenv"
import { version, author } from "./package.json"

dotenv.config()

console.log(`Finances manager v${version}`)

const {
  APP_PORT = 80,
  IDENTIFICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL,
  TZ,
} = process.env

// Set timezone
process.env.TZ = TZ || "Asia/Tokyo"

mongodb_connect()

const app = express()

// Express configuration
app.use(express.json())
app.use(cors())
app.use(apiMetrics())

app.get("/", (req, res) => {
  res.send({
    application_name: "Finances API",
    author,
    version,
    databases: {
      mongodb: { url: mongodb_url, db: mongodb_db },
      influxdb: { url: influxdb_url, db: influxdb_db },
    },
    auth: {
      identification_url: IDENTIFICATION_URL,
      group_auth: {
        url: GROUP_AUTHORIZATION_URL,
        groups: AUTHORIZED_GROUPS,
      },
    },
  })
})

// Authenticate everything from here
if (process.env.NODE_ENV !== "development")
  app.use(auth({ url: IDENTIFICATION_URL }))
if (AUTHORIZED_GROUPS && GROUP_AUTHORIZATION_URL) {
  console.log(`[Auth] Enabling group-based authorization`)
  const group_auth_options = {
    url: GROUP_AUTHORIZATION_URL,
    groups: AUTHORIZED_GROUPS.split(","),
  }
  app.use(group_auth(group_auth_options))
}

app.use("/accounts", require("./routes/accounts.js"))

// Those are not RESTful
app.use("/balance", require("./routes/balance.js"))
app.use("/transactions", require("./routes/transactions.js"))

// Start server
app.listen(APP_PORT, () => {
  console.log(`[Express] Finances API listening on *:${APP_PORT}`)
})
