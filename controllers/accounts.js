const {get_accounts_with_balance} = require('../controllers/balance.js')
const {get_accounts_with_transactions} = require('../controllers/transactions.js')

exports.get_accounts = async (req, res) => {


  const accounts_with_transactions = await get_accounts_with_transactions()
  const accounts_with_balance = await get_accounts_with_balance()

  // concat adn remove duplicates
  const accounts = accounts_with_transactions
    .concat(accounts_with_balance.filter((item) => accounts_with_transactions.indexOf(item) < 0))

  res.send(accounts)
}
