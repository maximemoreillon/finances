const createHttpError = require('http-errors')
const { Point } = require('@influxdata/influxdb-client')
const {
  org,
  bucket,
  writeApi,
  influx_read,
  deleteApi,
  measurement
} = require('../influxdb')


exports.register_balance = async (req,res, next) => {

  try {

    // TODO: use params
    const account = req.body.account
      || req.body.account_name
      || req.params.account
      || req.params.account_name
    
    const {
      currency,
      balance,
      time,
    } = req.body

    if (!currency) throw createHttpError(400, `currency not provided`)
    if (!balance) throw createHttpError(400, `balance not provided`)
    if (!account) throw createHttpError(400, `Account not defined`)

    // Create point
    const point = new Point(account).tag('currency', currency)

    // Timestamp
    if (time) point.timestamp(new Date(time))
    else point.timestamp(new Date())

    // Add weight
    if ((typeof balance) === 'number') point.floatField('balance', balance)
    else point.floatField('balance', parseFloat(balance))


    // write (flush is to actually perform the operation)
    writeApi.writePoint(point)
    await writeApi.flush()

    console.log(`Point created in measurement ${account}: ${balance}`)

    // Respond
    res.send(point)

  }
  catch (error) {
    next(error)
  }
}

exports.get_balance_history = async (req, res, next) => {

  try {

    const {account} = req.params

    // Filters
    // Using let because some variable types might change
    let {
      start = '0', // by default, query all points
      stop,
      tags = [],
      fields = [],
      limit = 500, // Limit point count by default, note: this is approximative
    } = req.query

    const stop_query = stop ? (`stop: ${stop}`) : ''


    // If only one tag provided, will be parsed as string so put it in an array
    if (typeof tags === 'string') tags = [tags]
    if (typeof fields === 'string') fields = [fields]

    // NOTE: check for risks of injection
    let query = `
      from(bucket:"${bucket}")
      |> range(start: ${start}, ${stop_query})
      |> filter(fn: (r) => r._measurement == "${account}")
      `


    // subsampling
    if (Number(limit)) {
      // Getting point count to compute the sampling from the limit
      const count_query = query + `|> count()`
      const record_count_query_result = await influx_read(count_query)
      const record_count = record_count_query_result[0]._value // Dirty here
      const sampling = Math.max(Math.round(12 * record_count / (limit)), 1) // Not sure why 12

      // Apply subsampling
      query += `|> sample(n:${sampling})`
    }


    // Run the query
    const points = await influx_read(query)

    // Respond to client
    res.send(points)

    console.log(`Balance history of account ${account} queried`)
  }
  catch (error) {
    next(error)
  }


}



const get_accounts_with_balance = async () => {

  const query = `
    import \"influxdata/influxdb/schema\"
    schema.measurements(bucket: \"${bucket}\")
    `

  // Run the query
  const result = await influx_read(query)

  // Extract measurements from result
  return result.map(r => r._value)
}
exports.get_accounts_with_balance = get_accounts_with_balance

exports.get_accounts = async (req,res) => {

  try {
    const accounts = await get_accounts_with_balance()
    res.send(accounts)
  }
  catch (error) {
    next(error)
  }
}
