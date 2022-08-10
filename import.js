const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const {
    IMPORT_URL,
    IMPORT_TOKEN,
    APP_PORT
} = process.env

const url = `${IMPORT_URL}/balance/history`


const account = 'bcv'
const headers = { authorization: `bearer ${IMPORT_TOKEN}`}
const params = {account}


const import_balance = async () => {
    const { data: items } = await axios.get(url, { params, headers })

    console.log(items)

    for (const item of items) {
        const upload_url = `http://192.168.1.2:${APP_PORT}/accounts/${account}/balance`
        await axios.post(upload_url, item, { headers })
        console.log(`Entry updated: ${item.time}`)
    }
}


import_balance()