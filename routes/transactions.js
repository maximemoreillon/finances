const {Router} = require('express')
const transaction_categories_router = require('./transaction_categories.js')
const transaction_controller = require('../controllers/transactions.js')

const router = Router({mergeParams: true})

router.route('/')
  .get(transaction_controller.get_transactions)
  .post(transaction_controller.register_transactions)

router.route('/accounts')
  .get(transaction_controller.get_accounts)

router.use('/categories', transaction_categories_router)


module.exports = router
