import { Router } from "express"
import {
  register_transactions,
  get_transactions,
  get_transaction,
  get_accounts,
  update_transaction,
  delete_transaction,
} from "../controllers/transactions"

const router = Router({ mergeParams: true })

router.route("/").get(get_transactions).post(register_transactions)

router.use("/categories", require("./transaction_categories"))

// Route to get accounts that have transactions
router.route("/accounts").get(get_accounts)

router
  .route("/:transaction_id")
  .get(get_transaction)
  .delete(delete_transaction)
  .patch(update_transaction)
  .put(update_transaction)

export default router
