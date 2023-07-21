import mongoose from "mongoose"

const { MONGODB_DB = "finances", MONGODB_URL = "mongodb://mongo:27017" } =
  process.env

export const connect = () =>
  new Promise((resolve) => {
    const mongodb_options = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }

    const connection_url = `${MONGODB_URL}/${MONGODB_DB}`

    mongoose
      .connect(connection_url, mongodb_options)
      .then(() => {
        console.log("[Mongoose] Initial connection successful")
        resolve()
      })
      .catch((error) => {
        console.log("[Mongoose] Initial connection failed")
        setTimeout(connect, 5000)
      })
  })

export const url = MONGODB_URL
export const db = MONGODB_DB
