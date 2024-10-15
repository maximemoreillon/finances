import { Router } from "express"
import { readBalance, registerBalance } from "../controllers/balance"

const router = Router({ mergeParams: true })

router.route("/").get(readBalance).post(registerBalance)

export default router
