import { Router } from "express"

import {
  createKeyword,
  deleteKeyword,
  readCategoryKeywords,
  readKeyword,
  updateKeyword,
} from "../controllers/keywords"

const router = Router({ mergeParams: true })

router.route("/").post(createKeyword).get(readCategoryKeywords)

router
  .route("/:keyword_id")
  .get(readKeyword)
  .put(updateKeyword)
  .delete(deleteKeyword)

export default router
