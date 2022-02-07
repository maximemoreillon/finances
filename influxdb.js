const Influx = require('influx')


const {
  INFLUXDB_URL = 'http://influxdb',
  INFLUXDB_DB = 'finances'
} = process.env

const influx = new Influx.InfluxDB({
  host: INFLUXDB_URL,
  database: INFLUXDB_DB,
})

// Create DB if it does not exist
exports.create_db_if_not_exist = () => {
  console.log(`[InfluxDB] Creating database ${INFLUXDB_DB}`);
  influx.getDatabaseNames()
    .then(names => {
      if (!names.includes(INFLUXDB_DB)) influx.createDatabase(INFLUXDB_DB);
      else `[InfluxDB] Database ${INFLUXDB_DB} already existed`
    })
    .catch(err => {
      console.error(`Error creating Influx database! ${err}`);
    })
}


exports.client = influx
exports.url = INFLUXDB_URL
exports.db = INFLUXDB_DB
