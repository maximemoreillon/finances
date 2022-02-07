const { Router } = require('express')
const transaction_category_controller = require('../controllers/transaction_categories.js')

const router = Router({mergeParams: true})

router.route('/')
  .get(transaction_category_controller.get_categories)
  .post(transaction_category_controller.create_category)

router.route('/:category_id')
  .get(transaction_category_controller.get_category)
  .put(transaction_category_controller.update_category)
  .delete(transaction_category_controller.delete_category)

module.exports = router
