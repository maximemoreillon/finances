import dotenv from "dotenv"
dotenv.config()

import { version, author } from "./package.json"
console.log(`Finances manager v${version}`)

import express from "express"
import "express-async-errors"
import cors from "cors"
import oidcAuth from "@moreillon/express-oidc"
import auth from "@moreillon/express_identification_middleware"
import group_auth from "@moreillon/express_group_based_authorization_middleware"
import {
  pool,
  TIMESCALEDB_DATABASE,
  TIMESCALEDB_HOST,
  TIMESCALEDB_PORT,
} from "./db"
import promBundle from "express-prom-bundle"

import accountsRouter from "./routes/accounts"
import exchangeRateRouter from "./routes/exchangeRate"
import categoriesRouter from "./routes/categories"
import transactionsRouter from "./routes/transactions"
import keywordsRouter from "./routes/keywords"

const {
  APP_PORT = 80,
  OIDC_JWKS_URI,
  IDENTIFICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL,
  TZ,
} = process.env

process.env.TZ = TZ || "Asia/Tokyo"
const promOptions = { includeMethod: true, includePath: true }

console.log(
  `[DB] connecting to postgresql://***:***@${TIMESCALEDB_HOST}:${TIMESCALEDB_PORT}/${TIMESCALEDB_DATABASE}`
)
pool.connect().then(() => {
  console.log("[DB] Connected")
})

const app = express()

app.use(express.json())
app.use(cors())
app.use(promBundle(promOptions))

app.get("/", (req, res) => {
  res.send({
    application_name: "Finances API",
    author,
    version,

    auth: {
      oidc_jwks_uri: OIDC_JWKS_URI,
      identification_url: IDENTIFICATION_URL,
      group_auth: {
        url: GROUP_AUTHORIZATION_URL,
        groups: AUTHORIZED_GROUPS,
      },
    },
    db: {
      host: TIMESCALEDB_HOST,
      port: TIMESCALEDB_PORT,
      db: TIMESCALEDB_DATABASE,
    },
  })
})

if (OIDC_JWKS_URI) {
  console.log(`[Auth] Enabling OIDC authentication using ${OIDC_JWKS_URI}`)
  app.use(oidcAuth({ jwksUri: OIDC_JWKS_URI }))
} else if (IDENTIFICATION_URL) {
  console.log(`[Auth] Enabling authentication using ${IDENTIFICATION_URL}`)
  app.use(auth({ url: IDENTIFICATION_URL }))
} else {
  console.log("[Auth] Authentication disabled")
}
if (AUTHORIZED_GROUPS && GROUP_AUTHORIZATION_URL) {
  console.log(`[Auth] Enabling group-based authorization`)
  const group_auth_options = {
    url: GROUP_AUTHORIZATION_URL,
    groups: AUTHORIZED_GROUPS.split(","),
  }
  app.use(group_auth(group_auth_options))
}

app.use("/accounts", accountsRouter)
app.use("/rate", exchangeRateRouter)
app.use("/categories", categoriesRouter)
app.use("/transactions", transactionsRouter)
app.use("/keywords", keywordsRouter)

app.listen(APP_PORT, () => {
  console.log(`[Express] Finances API listening on *:${APP_PORT}`)
})
