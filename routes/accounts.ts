/*
WARNING: Some accounts have only balances, some accounts have only transations, so difficult to list all accounts
*/
import { Router } from "express"
import { get_accounts } from "../controllers/accounts"
import balance_router from "./balance"
import transactions_router from "./transactions"

const router = Router()

router.route("/").get(get_accounts)

router.use("/:account/balance", balance_router)
router.use("/:account/transactions", transactions_router)

export default router
