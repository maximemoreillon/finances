import dotenv from "dotenv"
import { InfluxDB } from "@influxdata/influxdb-client"
import { DeleteAPI } from "@influxdata/influxdb-client-apis"
import { Agent } from "http"

dotenv.config()

const agent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 20 * 1000, // 20 seconds keep alive
})

const {
  INFLUXDB_URL = "localhost",
  INFLUXDB_TOKEN,
  INFLUXDB_ORG,
  INFLUXDB_BUCKET = "finances",
  PRECISION = "ns",
} = process.env

const influxDb = new InfluxDB({
  url: INFLUXDB_URL,
  token: INFLUXDB_TOKEN,
  transportOptions: { agent },
})

export const writeApi = influxDb.getWriteApi(
  INFLUXDB_ORG,
  INFLUXDB_BUCKET,
  PRECISION
)
export const queryApi = influxDb.getQueryApi(INFLUXDB_ORG)
export const deleteApi = new DeleteAPI(influxDb)

export const influx_read = (query) =>
  new Promise((resolve, reject) => {
    // helper function for Influx queries

    const results = []
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        // TODO: Find way to convert directly to an array
        const result = tableMeta.toObject(row)
        results.push(result)
      },
      error(error) {
        reject(error)
      },
      complete() {
        resolve(results)
      },
    })
  })

export const url = INFLUXDB_URL
export const org = INFLUXDB_ORG
export const bucket = INFLUXDB_BUCKET
export const token = INFLUXDB_TOKEN
