import mongoose from "mongoose"

export const {
  MONGODB_CONNECTION_STRING,
  MONGODB_PROTOCOL = "mongodb",
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_HOST = "localhost",
  MONGODB_PORT,
  MONGODB_DB = "food_manager",
  MONGODB_OPTIONS = "",
} = process.env

const mongodbPort = MONGODB_PORT ? `:${MONGODB_PORT}` : ""

const connectionString =
  MONGODB_CONNECTION_STRING ||
  (MONGODB_USERNAME && MONGODB_PASSWORD
    ? `${MONGODB_PROTOCOL}://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}${mongodbPort}/${MONGODB_DB}${MONGODB_OPTIONS}`
    : `${MONGODB_PROTOCOL}://${MONGODB_HOST}${mongodbPort}/${MONGODB_DB}${MONGODB_OPTIONS}`)

export const redactedConnectionString = connectionString.replace(
  /:.*@/,
  "://***:***@"
)

export const connect = () =>
  new Promise((resolve) => {
    console.log(`[Mongoose] Connecting to ${redactedConnectionString}`)

    const mongodb_options = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }

    mongoose
      .connect(connectionString, mongodb_options)
      .then(() => {
        console.log("[Mongoose] Initial connection successful")
        resolve("Connected")
      })
      .catch((error) => {
        console.log("[Mongoose] Initial connection failed")
        setTimeout(connect, 5000)
      })
  })
