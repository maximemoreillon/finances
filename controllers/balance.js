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

exports.get_balance_history = (req,res) => {

  res.status(501).send('not implemented')

}


const get_accounts_with_balance = async () => {

  const result = await influx.query(`SHOW MEASUREMENTS`)
  return result.map(e => e.name)
}
exports.get_accounts_with_balance = get_accounts_with_balance

exports.get_accounts = async (req,res) => {

  try {
    const accounts = await get_accounts_with_balance()
    res.send(accounts)
  }
  catch (e) {
    res.status(500).send(e)
  }
}
