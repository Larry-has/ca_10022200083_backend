const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, deliveryMethod = 'standard', notes } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Verify stock and prepare order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;

    if (!product || product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product?.name || 'product'}`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images[0]?.url
    });

    // Reduce stock
    product.stock -= item.quantity;
    await product.save();
  }

  // Calculate totals
  const itemsTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = deliveryMethod === 'express' ? 50 : (deliveryMethod === 'pickup' ? 0 : 20);
  const tax = 0;
  const totalAmount = itemsTotal + shippingCost + tax;

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending'
    },
    itemsTotal,
    shippingCost,
    tax,
    totalAmount,
    deliveryMethod,
    notes,
    estimatedDelivery: new Date(Date.now() + (deliveryMethod === 'express' ? 2 : 5) * 24 * 60 * 60 * 1000)
  });

  // Clear cart
  await cart.clearCart();

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order }
  });
});

// @desc    Get user's orders
// @route   GET /api/v1/orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { user: req.user.id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.json({
    success: true,
    data: { order }
  });
});

// @desc    Cancel order
// @route   POST /api/v1/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new ApiError(400, 'Order cannot be cancelled at this stage');
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }
    });
  }

  order.status = 'cancelled';
  await order.save();

  res.json({
    success: true,
    message: 'Order cancelled',
    data: { order }
  });
});
