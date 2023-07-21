/*
WARNING: Some accounts have only balances, some accounts have only transations, so difficult to list all accounts
*/
import { Router } from "express"
import { get_accounts } from "../controllers/accounts"

const router = Router()

router.route("/").get(get_accounts)

router.use("/:account/balance", require("./balance"))
router.use("/:account/transactions", require("./transactions"))

export default router
