const {client: influx, db: DB_name} = require('../influxdb')

exports.register_balance = (req,res) => {

  const account = req.body.account
    || req.body.account_name
    || req.params.account
    || req.params.account_name

  if(!account) return res.status(400).send(`Missing account name`)

  if(!req.body.currency) return res.status(400).send(`Missing currency`)
  if(!req.body.balance) return res.status(400).send(`Missing balance`)

  const points = [
    {
      measurement: account,
      tags: { currency: req.body.currency, },
      fields: { balance: req.body.balance },
      timestamp: new Date(),
    }
  ]

  const options = {
    database: DB_name,
    precision: 's',
  }

  influx.writePoints(points,options)
  .then( () => {
    res.send("Balance registered successfully")
    console.log(`Registered balance for account ${account}`)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(`Error saving data to InfluxDB! ${error}`)
  })
}

exports.get_balance_history = (req,res) => {

  let account = req.params.account
    || req.query.account

  if(!account) return res.status(400).send(`Missing account name`)

  influx.query(`SELECT * FROM ${account}`)
  .then( (result) => {
    res.send(result)
    console.log(`Queried balance history for account ${account}`)
  })
  .catch( (error) => {
    console.log(error)
    res.status(500).send(`Error getting balance from Influx: ${error}`)
  })
}

exports.get_current_balance = (req,res) => {

  let account = req.params.account
    || req.query.account

  if(!account) return res.status(400).send(`Missing account name`)

  influx.query(`SELECT * FROM ${account} GROUP BY * ORDER BY DESC LIMIT 1`)
  .then( (result) => {
    console.log(`Queried current balresult[0]ance for account ${account}`)
    const {balance, currency} = result[0]
    res.send({balance, currency})
  })
  .catch( (error) => {
    console.log(error)
    res.status(500).send(`Error getting balance from Influx: ${error}`)
  })
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
