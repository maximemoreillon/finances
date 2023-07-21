import createHttpError from "http-errors"
import { Point } from "@influxdata/influxdb-client"
import { INFLUXDB_BUCKET, writeApi, influx_read } from "../influxdb"
import { Request, Response } from "express"

export const register_balance = async (req: Request, res: Response) => {
  // TODO: use params
  const account =
    req.body.account ||
    req.body.account_name ||
    req.params.account ||
    req.params.account_name

  const { currency, balance, time } = req.body

  if (!currency) throw createHttpError(400, `currency not provided`)
  if (!balance) throw createHttpError(400, `balance not provided`)
  if (!account) throw createHttpError(400, `Account not defined`)

  // Create point
  const point = new Point(account).tag("currency", currency)

  // Timestamp
  if (time) point.timestamp(new Date(time))
  else point.timestamp(new Date())

  // Add weight
  if (typeof balance === "number") point.floatField("balance", balance)
  else point.floatField("balance", parseFloat(balance))

  // write (flush is to actually perform the operation)
  writeApi.writePoint(point)
  await writeApi.flush()

  console.log(`Point created in measurement ${account}: ${balance}`)

  // Respond
  res.send(point)
}

export const get_balance_history = async (req: Request, res: Response) => {
  const { account } = req.params

  // Filters
  // Using let because some variable types might change
  let {
    start = "0", // by default, query all points
    stop,
    tags = [],
    fields = [],
  } = req.query

  const stop_query = stop ? `stop: ${stop}` : ""

  // If only one tag provided, will be parsed as string so put it in an array
  if (typeof tags === "string") tags = [tags]
  if (typeof fields === "string") fields = [fields]

  // NOTE: check for risks of injection
  const query = `
      from(bucket:"${INFLUXDB_BUCKET}")
      |> range(start: ${start}, ${stop_query})
      |> filter(fn: (r) => r._measurement == "${account}")
      `

  // Run the query
  const points = await influx_read(query)

  // Respond to client
  res.send(points)

  console.log(`Balance history of account ${account} queried`)
}

export const get_accounts_with_balance = async () => {
  const query = `
    import \"influxdata/influxdb/schema\"
    schema.measurements(bucket: \"${INFLUXDB_BUCKET}\")
    `

  // Run the query
  const result = (await influx_read(query)) as any[]

  // Extract measurements from result
  return result.map((r: any) => r._value)
}

export const get_accounts = async (req: Request, res: Response) => {
  const accounts = await get_accounts_with_balance()
  res.send(accounts)
}
