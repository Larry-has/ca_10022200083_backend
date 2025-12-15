const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getUserOrders)
  .post(createOrder);

router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
