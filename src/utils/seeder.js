require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const sampleProducts = [
  {
    name: 'iPhone 15 Pro Max 256GB',
    description: 'Apple iPhone 15 Pro Max with A17 Pro chip, 48MP camera system, titanium design, and all-day battery life. Features Dynamic Island and Always-On display.',
    price: 8999,
    category: 'Smartphones',
    brand: 'Apple',
    stock: 25,
    images: [{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: true,
    tags: ['apple', 'iphone', 'flagship', 'pro']
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Samsung flagship with S Pen, 200MP camera, Snapdragon 8 Gen 3 processor. AI-powered features for photography and productivity.',
    price: 7499,
    category: 'Smartphones',
    brand: 'Samsung',
    stock: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: true,
    tags: ['samsung', 'galaxy', 'flagship', 'android']
  },
  {
    name: 'MacBook Pro 14" M3 Pro',
    description: 'Apple MacBook Pro with M3 Pro chip, 18GB RAM, 512GB SSD. Liquid Retina XDR display with ProMotion. Up to 17 hours battery life.',
    price: 14999,
    category: 'Laptops',
    brand: 'Apple',
    stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: true,
    tags: ['apple', 'macbook', 'laptop', 'pro']
  },
  {
    name: 'HP Pavilion 15 Laptop',
    description: 'HP Pavilion with Intel Core i5, 8GB RAM, 512GB SSD. 15.6" Full HD display. Perfect for work and entertainment.',
    price: 4299,
    category: 'Laptops',
    brand: 'HP',
    stock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['hp', 'pavilion', 'laptop', 'budget']
  },
  {
    name: 'iPad Pro 12.9" M2',
    description: 'Apple iPad Pro with M2 chip, Liquid Retina XDR display, Face ID, and support for Apple Pencil 2nd generation.',
    price: 8499,
    category: 'Tablets',
    brand: 'Apple',
    stock: 20,
    images: [{ url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: true,
    tags: ['apple', 'ipad', 'tablet', 'pro']
  },
  {
    name: 'Samsung Galaxy Tab S9+',
    description: 'Samsung premium tablet with 12.4" AMOLED display, Snapdragon 8 Gen 2, S Pen included. Water resistant design.',
    price: 5999,
    category: 'Tablets',
    brand: 'Samsung',
    stock: 18,
    images: [{ url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['samsung', 'galaxy', 'tablet', 'android']
  },
  {
    name: 'AirPods Pro 2nd Gen',
    description: 'Apple AirPods Pro with Active Noise Cancellation, Adaptive Audio, and USB-C charging case. Up to 6 hours listening time.',
    price: 1799,
    category: 'Audio',
    brand: 'Apple',
    stock: 50,
    images: [{ url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: true,
    tags: ['apple', 'airpods', 'earbuds', 'wireless']
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Sony premium noise-cancelling headphones with 30-hour battery life, multipoint connection, and exceptional sound quality.',
    price: 2499,
    category: 'Audio',
    brand: 'Sony',
    stock: 35,
    images: [{ url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: true,
    tags: ['sony', 'headphones', 'noise-cancelling', 'wireless']
  },
  {
    name: 'PlayStation 5 Console',
    description: 'Sony PS5 with ultra-high speed SSD, ray tracing, 4K gaming at up to 120fps. Includes DualSense wireless controller.',
    price: 4999,
    category: 'Gaming',
    brand: 'Sony',
    stock: 10,
    images: [{ url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: true,
    tags: ['sony', 'playstation', 'gaming', 'console']
  },
  {
    name: 'Xbox Series X',
    description: 'Microsoft Xbox Series X with 12 teraflops of power, 4K gaming, Quick Resume, and Xbox Game Pass compatibility.',
    price: 4499,
    category: 'Gaming',
    brand: 'Microsoft',
    stock: 12,
    images: [{ url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['microsoft', 'xbox', 'gaming', 'console']
  },
  {
    name: 'Apple Watch Series 9',
    description: 'Apple Watch with S9 chip, Double Tap gesture, bright Always-On display, and advanced health features including blood oxygen.',
    price: 3299,
    category: 'Wearables',
    brand: 'Apple',
    stock: 45,
    images: [{ url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: true,
    tags: ['apple', 'watch', 'smartwatch', 'fitness']
  },
  {
    name: 'Samsung Galaxy Watch 6 Classic',
    description: 'Samsung smartwatch with rotating bezel, advanced sleep coaching, body composition analysis, and Wear OS.',
    price: 2799,
    category: 'Wearables',
    brand: 'Samsung',
    stock: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['samsung', 'galaxy', 'smartwatch', 'android']
  },
  {
    name: 'Anker PowerCore 20000mAh',
    description: 'High-capacity portable charger with 20W USB-C fast charging. Charge 2 devices simultaneously.',
    price: 349,
    category: 'Accessories',
    brand: 'Anker',
    stock: 100,
    images: [{ url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['anker', 'powerbank', 'charger', 'portable']
  },
  {
    name: 'Logitech MX Master 3S Mouse',
    description: 'Premium wireless mouse with 8000 DPI sensor, quiet clicks, MagSpeed scroll wheel, and multi-device support.',
    price: 799,
    category: 'Accessories',
    brand: 'Logitech',
    stock: 60,
    images: [{ url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['logitech', 'mouse', 'wireless', 'productivity']
  },
  {
    name: 'Google Nest Hub Max',
    description: 'Smart display with 10" HD screen, Google Assistant, Nest Cam built-in, and video calling capabilities.',
    price: 1599,
    category: 'Smart Home',
    brand: 'Google',
    stock: 25,
    images: [{ url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['google', 'nest', 'smart-home', 'display']
  },
  {
    name: 'Canon EOS R6 Mark II',
    description: 'Full-frame mirrorless camera with 24.2MP sensor, 6K video, up to 40fps shooting, and advanced autofocus system.',
    price: 16999,
    category: 'Cameras',
    brand: 'Canon',
    stock: 8,
    images: [{ url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['canon', 'camera', 'mirrorless', 'professional']
  },
  {
    name: 'TP-Link Deco X60 Mesh WiFi 6',
    description: 'Whole home mesh WiFi 6 system covering up to 5000 sq ft. Supports 150+ devices with AI-driven mesh technology.',
    price: 1899,
    category: 'Networking',
    brand: 'TP-Link',
    stock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['tp-link', 'router', 'wifi6', 'mesh']
  },
  {
    name: 'Tecno Camon 20 Pro 5G',
    description: 'Tecno smartphone with 108MP camera, MediaTek Dimensity 8050, 5G connectivity, and 33W fast charging.',
    price: 2199,
    category: 'Smartphones',
    brand: 'Tecno',
    stock: 55,
    images: [{ url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['tecno', 'camon', 'budget', '5g']
  },
  {
    name: 'Infinix Note 30 Pro',
    description: 'Infinix smartphone with 108MP camera, 68W fast charging, MediaTek Helio G99, and 6.67" AMOLED display.',
    price: 1799,
    category: 'Smartphones',
    brand: 'Infinix',
    stock: 70,
    images: [{ url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['infinix', 'note', 'budget', 'fast-charging']
  },
  {
    name: 'JBL Charge 5 Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 20 hours playtime, IP67 waterproof rating, and built-in powerbank.',
    price: 1299,
    category: 'Audio',
    brand: 'JBL',
    stock: 45,
    images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', isPrimary: true }],
    isFeatured: false,
    tags: ['jbl', 'speaker', 'bluetooth', 'portable']
  }
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Data cleared');

    // Create admin user (password will be hashed by pre-save hook)
    await User.create({
      name: 'Admin User',
      email: 'admin@ghanatech.com',
      password: 'admin123',
      phone: '0241234567',
      role: 'admin'
    });

    // Create test customer
    await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'test123',
      phone: '0201234567',
      role: 'customer',
      addresses: [{
        street: '123 Oxford Street',
        city: 'Accra',
        region: 'Greater Accra',
        landmark: 'Near Osu Castle'
      }]
    });

    console.log('Users created');

    // Create products (use create to trigger pre-save hooks)
    for (const product of sampleProducts) {
      await Product.create(product);
    }
    console.log('Products created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
