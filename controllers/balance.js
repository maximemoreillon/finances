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

  influx.writePoints(
    [
      {
        measurement: account,
        tags: {
          currency: req.body.currency,
        },
        fields: {
          balance: req.body.balance
        },
        timestamp: new Date(),
      }
    ], {
      database: DB_name,
      precision: 's',
    })
    .then( () => res.send("Balance registered successfully"))
    .catch(error => res.status(500).send(`Error saving data to InfluxDB! ${error}`));
}
