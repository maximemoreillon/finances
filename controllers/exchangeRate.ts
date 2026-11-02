import axios from "axios"
import { Request, Response } from "express"
import { exchangeRateQuerySchema, parseBody } from "../validation"

export const getExchangeRate = async (req: Request, res: Response) => {
  const { currency } = parseBody(exchangeRateQuerySchema, req.query)
  const url = `https://open.er-api.com/v6/latest/${currency}`
  const { data } = await axios.get(url)
  res.send(data)
}
