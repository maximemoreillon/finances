const axios = require('axios')
const jwt = require('jsonwebtoken')
const secrets = require('./secrets')
const Influx = require('influx')

const DB_name = 'finances'


const influx = new Influx.InfluxDB({
  host: secrets.influx_url,
  database: DB_name,
})


influx.dropDatabase(DB_name)
.then( () => {
  influx.getDatabaseNames()
  .then(names => {
    if (!names.includes(DB_name)) {
      influx.createDatabase(DB_name)
      .then(() => {
        console.log('Creation OK')


        jwt.sign({ app: 'finances' }, secrets.jwt_secret, (err, token) => {

          axios.post('https://finances.maximemoreillon.com/get_balance_history',{}, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            }
          })
          .then(response => {

            console.log(response.data)


            let points = []


            response.data.forEach(entry => {
              points.push({
                measurement: "resona",
                tags: {
                  currency: "JPY",
                },
                fields: {
                  balance: entry.balance
                },
                timestamp: new Date(entry.date),
              })
            })

            influx.writePoints(points, {
                database: DB_name,
                precision: 's',
              })
              .then( () => console.log("OK"))
              .catch(error =>  console.log(`Error saving data to InfluxDB! ${error}`));

          })
          .catch(error => {console.log(error)})

        });

      })
      .catch( error =>  console.log(error) );
    }
  })
  .catch(error => console.log(error));
})
.catch(error => console.log(error));
