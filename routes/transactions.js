const {Router} = require('express')
const {
  get_transactions,
  register_transactions,
  get_accounts
} = require('../controllers/transactions.js')

const router = Router({mergeParams: true})

router.route('/')
  .get(get_transactions)
  .post(register_transactions)

// Route to get accounts that have transactions
router.route('/accounts')
  .get(get_accounts)

router.use('/categories', require('./transaction_categories'))


module.exports = router
