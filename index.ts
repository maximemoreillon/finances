import "dotenv/config";

import { version, author } from "./package.json";
console.log(`Finances manager v${version}`);

import express, { NextFunction, Request, Response, Router } from "express";
import "express-async-errors";
import cors from "cors";
import oidcAuth from "@moreillon/express-oidc";
import { pool, DB_DATABASE, DB_HOST, DB_PORT } from "./db";
import promBundle from "express-prom-bundle";
import { isHttpError } from "http-errors";

import accountsRouter from "./routes/accounts";
import exchangeRateRouter from "./routes/exchangeRate";
import categoriesRouter from "./routes/categories";
import transactionsRouter from "./routes/transactions";
import keywordsRouter from "./routes/keywords";

const { APP_PORT = 80, OIDC_JWKS_URI, TZ, BASE_PATH } = process.env;

process.env.TZ = TZ || "Asia/Tokyo";
const promOptions = { includeMethod: true, includePath: true };

console.log(
  `[DB] connecting to postgresql://***:***@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
);
// Startup connectivity check: release the client so it returns to the pool
pool.connect().then((client) => {
  client.release();
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
      host: DB_HOST,
      port: DB_PORT,
      db: DB_DATABASE,
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

// JSON errors instead of Express's default HTML page with a stack trace.
// http-errors (and body-parser's malformed JSON errors) carry a status and a
// client-safe message; anything else is logged and reported as a generic 500
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(error);

  // isHttpError also matches by shape: body-parser throws errors from its own copy of http-errors
  if (isHttpError(error) && error.expose) {
    res.status(error.status).send({ message: error.message });
    return;
  }

  console.error(error);
  const status = isHttpError(error) ? error.status : 500;
  res.status(status).send({ message: "Internal server error" });
});

app.listen(APP_PORT, () => {
  console.log(`[Express] Finances API listening on *:${APP_PORT}`);
});
