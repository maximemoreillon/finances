import { Router } from "express"
import {
  createCategory,
  readCategories,
  readCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories"
import keywordsRouter from "./keywords"
const router = Router({ mergeParams: true })

router.route("/").post(createCategory).get(readCategories)

router
  .route("/:category_id")
  .get(readCategory)
  .put(updateCategory)
  .delete(deleteCategory)

router.use("/:category_id/keywords", keywordsRouter)

export default router
