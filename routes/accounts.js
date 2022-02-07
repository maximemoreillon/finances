/*
WARNING: Some accounts have only balances, some accounts have only transations, so difficult to list all accounts from one DB
*/
const {Router} = require('express')
const {
  get_accounts
} = require('../controllers/accounts.js')

const router = Router()

router.route('/')
  .get(get_accounts)

module.exports = router
