import { Router } from "express"
import {
  createAccount,
  deleteAccount,
  readAccount,
  readAccounts,
  updateAccount,
} from "../controllers/accounts"
import balance_router from "./balance"
import transactions_router from "./transactions"

const router = Router()

router.route("/").post(createAccount).get(readAccounts)
router
  .route("/:account_id")
  .get(readAccount)
  .put(updateAccount)
  .delete(deleteAccount)

router.use("/:account_id/balance", balance_router)
router.use("/:account_id/transactions", transactions_router)

export default router
