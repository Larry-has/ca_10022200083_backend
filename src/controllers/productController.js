const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    search
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews'),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('reviews.user', 'name');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({
    success: true,
    data: { product }
  });
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .limit(8)
    .select('-reviews');

  res.json({
    success: true,
    data: { products }
  });
});

// @desc    Get product categories
// @route   GET /api/v1/products/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = [
    'Smartphones',
    'Laptops',
    'Tablets',
    'Accessories',
    'Audio',
    'Gaming',
    'Smart Home',
    'Wearables',
    'Cameras',
    'Networking'
  ];

  // Get count per category
  const categoryCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  categoryCounts.forEach(c => {
    countMap[c._id] = c.count;
  });

  const result = categories.map(cat => ({
    name: cat,
    count: countMap[cat] || 0
  }));

  res.json({
    success: true,
    data: { categories: result }
  });
});

// @desc    Add product review
// @route   POST /api/v1/products/:id/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if already reviewed
  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user.id
  );

  if (alreadyReviewed) {
    throw new ApiError(400, 'You have already reviewed this product');
  }

  product.reviews.push({
    user: req.user.id,
    rating: Number(rating),
    comment
  });

  product.calculateAverageRating();
  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added',
    data: { product }
  });
});

// @desc    Get related products
// @route   GET /api/v1/products/:id/related
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [
      { category: product.category },
      { brand: product.brand }
    ]
  })
    .limit(4)
    .select('-reviews');

  res.json({
    success: true,
    data: { products: relatedProducts }
  });
});
