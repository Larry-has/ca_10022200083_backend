# GhanaTech Store - Backend API

A Node.js/Express REST API for the GhanaTech E-commerce platform.

## Tech Stack

- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

3. Seed the database:
```bash
npm run seed
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)

### Products
- `GET /api/v1/products` - Get all products (with filters)
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/:id` - Get single product
- `GET /api/v1/products/:id/related` - Get related products

### Cart (Protected)
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart` - Add item to cart
- `PUT /api/v1/cart/:productId` - Update item quantity
- `DELETE /api/v1/cart/:productId` - Remove item

### Orders (Protected)
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user's orders
- `GET /api/v1/orders/:id` - Get single order

### Admin (Admin only)
- `GET /api/v1/admin/dashboard` - Dashboard stats
- `POST /api/v1/admin/products` - Create product
- `PUT /api/v1/admin/products/:id` - Update product
- `DELETE /api/v1/admin/products/:id` - Delete product
- `GET /api/v1/admin/orders` - Get all orders
- `PUT /api/v1/admin/orders/:id` - Update order status

## Demo Accounts

After seeding:
- **Admin**: admin@ghanatech.com / admin123
- **Customer**: customer@test.com / test123
