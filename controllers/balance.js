const Influx = require('influx')
const dotenv = require('dotenv')

dotenv.config()

const DB_name = 'finances'

const influx = new Influx.InfluxDB({
  host: process.env.INFLUXDB_URL,
  database: DB_name,
})



exports.register_balance = (req,res) => {

  let account = req.body.account
    || req.body.account_name
    || req.params.account
    || req.params.account_name

  if(!account) return res.status(400).send(`Missing account name`)

  if(!req.body.currency) return res.status(400).send(`Missing currency`)
  if(!req.body.balance) return res.status(400).send(`Missing balance`)

  influx.writePoints(
    [
      {
        measurement: account,
        tags: { currency: req.body.currency, },
        fields: { balance: req.body.balance },
        timestamp: new Date(),
      }
    ], {
      database: DB_name,
      precision: 's',
    })
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
    console.log(`Queried current balance for account ${account}`)
    res.send(result[0].balance)
  })
  .catch( (error) => {
    console.log(error)
    res.status(500).send(`Error getting balance from Influx: ${error}`)
  })
}

exports.get_accounts = (req,res) => {

  influx.query(`SHOW MEASUREMENTS`)
  .then( (result) => {
    res.send(result)
    console.log(`Queries list of accounts for balance`)
  })
  .catch( (error) => {
    res.status(500).send(`Error getting measurements from Influx: ${error}`)
    console.log(error)
  })
}
