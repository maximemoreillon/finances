import { Router } from "express"
import {
  registerTransaction,
  readTransaction,
  readTransactions,
  update_transaction,
  delete_transaction,
} from "../controllers/transactions"
import {
  addCategoryToStransaction,
  readTransactionCategories,
  removeCategoryFromtransaction,
} from "../controllers/transactionCategories"

const router = Router({ mergeParams: true })

router.route("/").get(readTransactions).post(registerTransaction)

router
  .route("/:transaction_id")
  .get(readTransaction)
  .put(update_transaction)
  .delete(delete_transaction)

router
  .route("/:transaction_id/categories")
  .post(addCategoryToStransaction)
  .get(readTransactionCategories)

router
  .route("/:transaction_id/categories/:category_id")
  .delete(removeCategoryFromtransaction)

export default router
