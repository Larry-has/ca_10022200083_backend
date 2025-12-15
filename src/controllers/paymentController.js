const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const paystack = require('../services/paystack');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Initialize Paystack payment
// @route   POST /api/v1/payments/initialize
// @access  Private
exports.initializePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findOne({ _id: orderId, user: req.user.id });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.payment.status === 'completed') {
    throw new ApiError(400, 'Order already paid');
  }

  // Generate unique reference
  const reference = `GTS-${order.orderNumber}-${Date.now()}`;

  const result = await paystack.initializeTransaction({
    email: req.user.email,
    amount: order.totalAmount,
    reference,
    callback_url: `${process.env.FRONTEND_URL}/orders/${order._id}?payment=success`,
    metadata: {
      order_id: order._id.toString(),
      order_number: order.orderNumber,
      user_id: req.user.id,
    },
  });

  // Save reference to order
  order.payment.transactionId = reference;
  await order.save();

  res.json({
    success: true,
    data: {
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
      reference: result.data.reference,
    },
  });
});

// @desc    Verify Paystack payment
// @route   GET /api/v1/payments/verify/:reference
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const result = await paystack.verifyTransaction(reference);

  if (result.data.status === 'success') {
    const orderId = result.data.metadata.order_id;

    const order = await Order.findById(orderId);

    if (order) {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
      order.payment.transactionId = reference;
      order.payment.method = result.data.channel === 'mobile_money' ? 'mobile_money' : 'card';

      if (result.data.authorization?.bank) {
        order.payment.provider = result.data.authorization.bank;
      }

      order.status = 'confirmed';
      await order.save();

      // Reduce stock for each product
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear user's cart
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], totalItems: 0, totalPrice: 0 }
      );
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        status: 'success',
        order: order,
      },
    });
  } else {
    res.json({
      success: false,
      message: 'Payment not successful',
      data: {
        status: result.data.status,
      },
    });
  }
});

// @desc    Paystack webhook handler
// @route   POST /api/v1/payments/webhook
// @access  Public (Paystack only)
exports.paystackWebhook = asyncHandler(async (req, res) => {
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data;

    const order = await Order.findById(metadata.order_id);

    if (order && order.payment.status !== 'completed') {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
      order.payment.transactionId = reference;
      order.status = 'confirmed';
      await order.save();

      // Reduce stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear cart
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], totalItems: 0, totalPrice: 0 }
      );
    }
  }

  res.sendStatus(200);
});
