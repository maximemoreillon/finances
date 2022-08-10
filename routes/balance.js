const { Router } = require('express')
const {
  get_balance_history,
  get_accounts,
  register_balance
} = require('../controllers/balance.js')

const router = Router({mergeParams: true})

// Seems to be missing routes here
router.route('/')
  .get(get_balance_history)
  .post(register_balance)

router.route('/accounts')
  .get(get_accounts)


module.exports = router
