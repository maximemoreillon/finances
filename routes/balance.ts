import { Router } from "express"
import {
  get_balance_history,
  get_accounts,
  register_balance,
} from "../controllers/balance"

const router = Router({ mergeParams: true })

router.route("/").get(get_balance_history).post(register_balance)

router.route("/accounts").get(get_accounts)

export default router
