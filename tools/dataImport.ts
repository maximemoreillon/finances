import { client } from "./client"

const {
  LEGACY_FINANCES_API_URL = "http://localhost",
  LEGACY_FINANCES_ACCOUNT = "",
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  OIDC_TOKEN_URL = "http://localhost",
  OIDC_AUDIENCE,
  OIDC_M2M_ACCESS_TOKEN,
} = process.env

async function getAccessToken() {
  const res = await fetch(OIDC_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: OIDC_CLIENT_ID,
      client_secret: OIDC_CLIENT_SECRET,
      audience: OIDC_AUDIENCE,
      grant_type: "client_credentials",
    }),
  })

  const { access_token } = await res.json()

  console.log({ access_token })

  return access_token
}

async function fetchBalance(access_token: string) {
  const res = await fetch(
    `${LEGACY_FINANCES_API_URL}/accounts/${LEGACY_FINANCES_ACCOUNT}/balance`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )
  const data = await res.json()
  return data
}

async function importBalance(access_token: string) {
  const records = await fetchBalance(access_token)
  try {
    for (const record of records) {
      const { _time, _value } = record
      await client.query(
        `INSERT INTO balance(account_id, time, balance) 
        VALUES(4, $1, $2)
        ON CONFLICT DO NOTHING`,
        [_time, _value]
      )
      console.log({ _time, _value })
    }
  } catch (error) {
    console.error(error)
  }
}

async function fetchTransactions(access_token: string) {
  const res = await fetch(
    `${LEGACY_FINANCES_API_URL}/accounts/${LEGACY_FINANCES_ACCOUNT}/transactions`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )
  const data = await res.json()
  return data
}

async function getKeywords() {
  const sql = "SELECT * FROM keyword"
  const { rows } = await client.query(sql, [])
  return rows
}

async function importTransactions(accessToken: string) {
  const account_id = 4
  const transactions = await fetchTransactions(accessToken)

  // TODO: get category keywords
  const keywords = await getKeywords()

  try {
    for (const { date, amount, description } of transactions) {
      const {
        rows: [newTransaction],
      } = await client.query(
        `INSERT INTO transaction(account_id, time, amount, description)
        VALUES($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
        RETURNING *
        `,
        [account_id, date, amount, description]
      )

      if (newTransaction) {
        const matchingKeywords = keywords.filter(({ word }) =>
          description.includes(word)
        )

        for (const keyword of matchingKeywords) {
          await client.query(
            `INSERT INTO transaction_category(transaction_id, category_id)
            VALUES($1, $2)`,
            [newTransaction.id, keyword.category_id]
          )
        }
        console.log(`${date} ${description} ${amount}`)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

async function fetchCategories(access_token: string) {
  const res = await fetch(
    `${LEGACY_FINANCES_API_URL}/transactions/categories`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )
  const data = await res.json()
  return data
}

async function importCategories(access_token: string) {
  const records = await fetchCategories(access_token)

  try {
    for (const record of records) {
      const { label, keywords } = record

      const {
        rows: [{ id }],
      } = await client.query(
        `INSERT INTO category(name)
        VALUES($1)
        RETURNING *`,
        [label]
      )

      for (const keyword of keywords) {
        await client.query(
          `INSERT INTO keyword(category_id, word)
          VALUES($1, $2)
          RETURNING *`,
          [id, keyword]
        )
      }

      console.log(label)
    }
  } catch (error) {
    console.error(error)
  }
}

async function main() {
  let accessToken: string | undefined = OIDC_M2M_ACCESS_TOKEN

  if (!accessToken) {
    console.log("Access token not available, fetching...")
    accessToken = await getAccessToken()
  } else {
    console.log("Access token available")
  }

  if (!accessToken) {
    throw new Error("Access token not available")
  }
  client.connect()

  await importCategories(accessToken)
  await importTransactions(accessToken)

  // await importBalance(accessToken)

  client.end()
}

main()
