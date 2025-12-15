const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get user's cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name price stock images slug');

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  res.json({
    success: true,
    data: { cart }
  });
});

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Verify product exists and has stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  if (product.stock < quantity) {
    throw new ApiError(400, 'Insufficient stock');
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Add item
  await cart.addItem(productId, quantity, product.price);

  // Populate and return
  await cart.populate('items.product', 'name price stock images slug');

  res.json({
    success: true,
    message: 'Item added to cart',
    data: { cart }
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:productId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Verify stock
  const product = await Product.findById(productId);
  if (product && product.stock < quantity) {
    throw new ApiError(400, 'Insufficient stock');
  }

  await cart.updateItemQuantity(productId, quantity);
  await cart.populate('items.product', 'name price stock images slug');

  res.json({
    success: true,
    message: 'Cart updated',
    data: { cart }
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:productId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  await cart.removeItem(req.params.productId);
  await cart.populate('items.product', 'name price stock images slug');

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: { cart }
  });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  await cart.clearCart();

  res.json({
    success: true,
    message: 'Cart cleared',
    data: { cart }
  });
});
