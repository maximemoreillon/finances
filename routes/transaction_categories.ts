import { Router } from "express"
import {
  create_category,
  get_categories,
  get_category,
  update_category,
  delete_category,
} from "../controllers/transaction_categories"

const router = Router({ mergeParams: true })

router.route("/").get(get_categories).post(create_category)

router
  .route("/:category_id")
  .get(get_category)
  .put(update_category)
  .delete(delete_category)

export default router
