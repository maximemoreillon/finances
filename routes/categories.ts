import { Router } from "express"
import {
  createCategory,
  readCategories,
  readCategory,
  updateCategory,
  deleteCategory,
  applyCategories,
} from "../controllers/categories"
import keywordsRouter from "./keywords"
import { readTransactions } from "../controllers/transactions"
const router = Router({ mergeParams: true })

router
  .route("/")
  .post(createCategory)
  .get(readCategories)
  .patch(applyCategories)

router
  .route("/:category_id")
  .get(readCategory)
  .put(updateCategory)
  .delete(deleteCategory)

router.use("/:category_id/keywords", keywordsRouter)
router.get("/:category_id/transactions", readTransactions)

export default router
