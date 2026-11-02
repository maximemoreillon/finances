import { Router } from "express"
import { deleteBalance, readBalance, registerBalance } from "../controllers/balance"

const router = Router({ mergeParams: true })

router.route("/").get(readBalance).post(registerBalance).delete(deleteBalance)

export default router
