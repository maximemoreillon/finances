import { get_accounts_with_balance } from "../controllers/balance"
import { get_accounts_with_transactions } from "../controllers/transactions"
import { Request, Response } from "express"

export const get_accounts = async (req: Request, res: Response) => {
  const accounts_with_transactions = await get_accounts_with_transactions()
  const accounts_with_balance = await get_accounts_with_balance()

  // concat and remove duplicates
  const accounts = accounts_with_transactions.concat(
    accounts_with_balance.filter(
      (item: any) => accounts_with_transactions.indexOf(item) < 0
    )
  )

  res.send(accounts)
}
