# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Run in development mode with nodemon (hot reload)
npm run build    # Compile TypeScript to ./build/
npm run start    # Run compiled output (production)
```

To run one-off database tools directly with ts-node:

```bash
npx ts-node tools/createTables.ts   # Initialize DB schema
npx ts-node tools/dropTables.ts     # Drop all tables
npx ts-node tools/dataImport.ts     # Import data from another API instance
npx ts-node tools/applyCategories.ts
```

## Architecture

This is a Node.js/Express REST API in TypeScript backed by **TimescaleDB** (PostgreSQL-compatible). There are no tests.

**Request flow:** `index.ts` → `routes/*.ts` → `controllers/*.ts` → `db.ts` (pg Pool)

### Database schema

Six tables managed via `tools/createTables.ts`:

- `account` — bank accounts (name, currency)
- `transaction` — financial transactions; unique constraint on `(time, description, amount, account_id)` prevents duplicates on import
- `balance` — account balance over time; a TimescaleDB **hypertable** partitioned by `time`
- `category` — transaction categories
- `transaction_category` — many-to-many join between transactions and categories
- `keyword` — maps a text keyword to a category; used to auto-categorize new transactions

### Auto-categorization

When a transaction is inserted, `utils.ts:addCategoriesToTransaction` scans all keywords and inserts matching `transaction_category` rows. This is called in `controllers/transactions.ts` and also in `tools/dataImport.ts`.

### Environment variables

| Variable        | Default      | Purpose                                                                                                      |
| --------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| `APP_PORT`      | `80`         | Express listen port                                                                                          |
| `DB_HOST`       | `localhost`  | DB host                                                                                                      |
| `DB_PORT`       | `5432`       | DB port                                                                                                      |
| `DB_USER`       | `postgres`   | DB user                                                                                                      |
| `DB_PASSWORD`   | ``           | DB password                                                                                                  |
| `DB_DATABASE`   | `finances`   | DB name                                                                                                      |
| `OIDC_JWKS_URI` | —            | If set, enables OIDC JWT auth on all routes via `@moreillon/express-oidc`                                    |
| `BASE_PATH`     | —            | If set, mounts the router at an additional path (e.g. `/api`)                                                |
| `DB_ENABLED`    | —            | Set to `true` to create the `balance` table as a TimescaleDB hypertable when running `tools/createTables.ts` |
| `TZ`            | `Asia/Tokyo` | Process timezone                                                                                             |

### Auth

OIDC authentication is optional and controlled by `OIDC_JWKS_URI`. When unset, all routes are unauthenticated. In production (Kubernetes), secrets come from Vault via ExternalSecrets.

### Deployment

CI/CD is GitLab CI (`.gitlab-ci.yml`): builds a Docker image on `master` and deploys to a home Kubernetes cluster using `kubectl` + `envsubst` on `kubernetes_manifest.yml`.
