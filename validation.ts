import createHttpError from "http-errors"
import { z } from "zod"

// Only checked for validity: the original string is passed on so Postgres keeps parsing it as before
const time = z
  .union([z.string(), z.number()])
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date")

// Matches the transaction.description VARCHAR(50) column
// Not trimmed: existing rows keep their whitespace and must still match the unique constraint
const description = z
  .string()
  .max(50)
  .refine((value) => value.trim().length > 0, "Missing description")

// z.number() rejects NaN, Infinity and numeric strings
export const registerTransactionSchema = z.object({
  // Empty string is what the front end sends when no date is picked
  time: z.preprocess((value) => (value === "" ? undefined : value), time.optional()),
  amount: z.number(),
  description,
})

export const updateTransactionSchema = z.object({
  time,
  amount: z.number(),
  description,
})

export const registerBalanceSchema = z.object({
  time: time.optional(),
  balance: z.number(),
})

export const deleteBalanceQuerySchema = z.object({
  time,
})

// ISO 4217 code, interpolated into the upstream exchange rate URL
export const exchangeRateQuerySchema = z.object({
  currency: z.string().regex(/^[A-Za-z]{3}$/, "Invalid currency code"),
})

export const parseBody = <T extends z.ZodType>(schema: T, body: unknown) => {
  const result = schema.safeParse(body)
  if (!result.success)
    throw createHttpError(400, z.prettifyError(result.error))
  return result.data
}
