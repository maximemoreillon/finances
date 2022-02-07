const { Router } = require('express')
const balance_controller = require('../controllers/balance.js')

const router = Router({mergeParams: true})

// Seems to be missing routes here
router.route('/')
  .get(balance_controller.get_current_balance) // NOT RESTFUL
  .post(balance_controller.register_balance)

router.route('/accounts')
  .get(balance_controller.get_accounts)

router.route('/current')
  .get(balance_controller.get_current_balance)

router.route('/history')
  .get(balance_controller.get_balance_history)

module.exports = router
