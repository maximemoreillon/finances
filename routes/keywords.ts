import { Router } from "express"

import {
  createKeyword,
  deleteKeyword,
  readCategoryKeywords,
} from "../controllers/keywords"

const router = Router({ mergeParams: true })

router.route("/").post(createKeyword).get(readCategoryKeywords)

router.route("/:keyword_id").delete(deleteKeyword)

export default router
