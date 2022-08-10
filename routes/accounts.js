/*
WARNING: Some accounts have only balances, some accounts have only transations, so difficult to list all accounts
*/
const {Router} = require('express')
const {
  get_accounts
} = require('../controllers/accounts.js')

const router = Router()

router.route('/')
  .get(get_accounts)

router.use('/:account/balance', require('./balance'))

module.exports = router
