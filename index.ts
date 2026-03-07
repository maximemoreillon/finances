import "dotenv/config";

import { version, author } from "./package.json";
console.log(`Finances manager v${version}`);

import express, { Router } from "express";
import "express-async-errors";
import cors from "cors";
import oidcAuth from "@moreillon/express-oidc";
import {
  pool,
  TIMESCALEDB_DATABASE,
  TIMESCALEDB_HOST,
  TIMESCALEDB_PORT,
} from "./db";
import promBundle from "express-prom-bundle";

import accountsRouter from "./routes/accounts";
import exchangeRateRouter from "./routes/exchangeRate";
import categoriesRouter from "./routes/categories";
import transactionsRouter from "./routes/transactions";
import keywordsRouter from "./routes/keywords";

const { APP_PORT = 80, OIDC_JWKS_URI, TZ, BASE_PATH } = process.env;

process.env.TZ = TZ || "Asia/Tokyo";
const promOptions = { includeMethod: true, includePath: true };

console.log(
  `[DB] connecting to postgresql://***:***@${TIMESCALEDB_HOST}:${TIMESCALEDB_PORT}/${TIMESCALEDB_DATABASE}`,
);
pool.connect().then(() => {
  console.log("[DB] Connected");
});

const app = express();

app.use(express.json());
app.use(cors());
app.use(promBundle(promOptions));

const router = Router();

router.get("/", (req, res) => {
  res.send({
    application_name: "Finances API",
    author,
    version,
    base_path: BASE_PATH || "/",
    auth: {
      enabled: !!OIDC_JWKS_URI,
      oidc_jwks_uri: OIDC_JWKS_URI,
    },
    db: {
      host: TIMESCALEDB_HOST,
      port: TIMESCALEDB_PORT,
      db: TIMESCALEDB_DATABASE,
    },
  });
});

if (OIDC_JWKS_URI) {
  console.log(`[Auth] Enabling OIDC authentication using ${OIDC_JWKS_URI}`);
  router.use(oidcAuth({ jwksUri: OIDC_JWKS_URI }));
} else {
  console.log("[Auth] Authentication disabled");
}

router.use("/accounts", accountsRouter);
router.use("/rate", exchangeRateRouter);
router.use("/categories", categoriesRouter);
router.use("/transactions", transactionsRouter);
router.use("/keywords", keywordsRouter);

app.use("/", router);

if (BASE_PATH) app.use(BASE_PATH, router);

app.listen(APP_PORT, () => {
  console.log(`[Express] Finances API listening on *:${APP_PORT}`);
});
