import TransactionCategory from "../models/transaction_category"
import { Request, Response } from "express"

export const get_categories = async (req: Request, res: Response) => {
  const categories = await TransactionCategory.find({})
  res.send(categories)
}

export const create_category = async (req: Request, res: Response) => {
  const category = await TransactionCategory.create(req.body)
  res.send(category)
}

export const get_category = async (req: Request, res: Response) => {
  const { category_id } = req.params

  const category = await TransactionCategory.findById(category_id)
  console.log(`Transaction category ${category_id} queried`)
  res.send(category)
}

export const update_category = async (req: Request, res: Response) => {
  const { category_id } = req.params

  const properties = req.body

  const result = await TransactionCategory.findByIdAndUpdate(
    category_id,
    properties
  )
  console.log(`Transaction category ${category_id} updated`)
  res.send(result)
}

export const delete_category = async (req: Request, res: Response) => {
  const { category_id } = req.params

  const result = await TransactionCategory.findByIdAndDelete(category_id)
  console.log(`Transaction category ${category_id} deleted`)
  res.send(result)
}
