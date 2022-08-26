const {Router} = require('express')
const {
  register_transactions,
  get_transactions,
  get_transaction,
  get_accounts,
  update_transaction,
  delete_transaction
} = require('../controllers/transactions.js')

const router = Router({mergeParams: true})

router.route('/')
  .get(get_transactions)
  .post(register_transactions)

router.use('/categories', require('./transaction_categories'))

// Route to get accounts that have transactions
router.route('/accounts')
  .get(get_accounts)

router.route('/:transaction_id')
  .get(get_transaction)
  .delete(delete_transaction)
  .patch(update_transaction)
  .put(update_transaction)





module.exports = router
