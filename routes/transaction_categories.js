const { Router } = require('express')
const {
  create_category,
  get_categories,
  get_category,
  update_category,
  delete_category
} = require('../controllers/transaction_categories.js')

const router = Router({mergeParams: true})

router.route('/')
  .get(get_categories)
  .post(create_category)

router.route('/:category_id')
  .get(get_category)
  .put(update_category)
  .delete(delete_category)

module.exports = router
