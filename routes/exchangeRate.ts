import { Router } from "express"
import { getExchangeRate } from "../controllers/exchangeRate"

const router = Router({ mergeParams: true })

router.route("/").get(getExchangeRate)

export default router
