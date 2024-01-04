import express from "express"
import "express-async-errors"
import cors from "cors"
import auth from "@moreillon/express_identification_middleware"
import group_auth from "@moreillon/express_group_based_authorization_middleware"
import {
  connect as mongodb_connect,
  redactedConnectionString as mongodbConnectionString,
} from "./mongodb"
import { INFLUXDB_URL, INFLUXDB_BUCKET, INFLUXDB_ORG } from "./influxdb"
import promBundle from "express-prom-bundle"
import dotenv from "dotenv"
import { version, author } from "./package.json"

import balance_router from "./routes/balance"
import accounts_router from "./routes/accounts"
import transactions_router from "./routes/transactions"
import exchangeRateRouter from "./routes/exchangeRate"

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
const promOptions = { includeMethod: true, includePath: true }

mongodb_connect()

const app = express()

// Express configuration
app.use(express.json())
app.use(cors())
app.use(promBundle(promOptions))

app.get("/", (req, res) => {
  res.send({
    application_name: "Finances API",
    author,
    version,
    databases: {
      mongodb: { connection_string: mongodbConnectionString },
      influxdb: {
        url: INFLUXDB_URL,
        bucket: INFLUXDB_BUCKET,
        org: INFLUXDB_ORG,
      },
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
if (IDENTIFICATION_URL) {
  console.log(`[Auth] Enabling authentication using ${IDENTIFICATION_URL}`)
  app.use(auth({ url: IDENTIFICATION_URL }))
}
if (AUTHORIZED_GROUPS && GROUP_AUTHORIZATION_URL) {
  console.log(`[Auth] Enabling group-based authorization`)
  const group_auth_options = {
    url: GROUP_AUTHORIZATION_URL,
    groups: AUTHORIZED_GROUPS.split(","),
  }
  app.use(group_auth(group_auth_options))
}

app.use("/accounts", accounts_router)

// Those are not RESTful
app.use("/balance", balance_router)
app.use("/transactions", transactions_router)
app.use("/rate", exchangeRateRouter)
// Start server
app.listen(APP_PORT, () => {
  console.log(`[Express] Finances API listening on *:${APP_PORT}`)
})
