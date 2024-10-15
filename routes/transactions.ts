import { Router } from "express"
import {
  register_transactions,
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

router.route("/").get(readTransactions).post(register_transactions)

router
  .route("/:transaction_id")
  .get(readTransaction)
  .delete(delete_transaction)
  .patch(update_transaction)
  .put(update_transaction)

router
  .route("/:transaction_id/categories")
  .post(addCategoryToStransaction)
  .get(readTransactionCategories)

router
  .route("/:transaction_id/categories/:category_id")
  .delete(removeCategoryFromtransaction)

export default router
