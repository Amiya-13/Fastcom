<<<<<<< HEAD
# Fastcom
MERN stack e-commerce platform connecting customers with local vendors
=======
# FastCom - E-Commerce Platform

> Connecting customers with local vendors

FastCom is a modern MERN stack e-commerce platform that bridges the gap between customers and local shop vendors. The platform enables shopkeepers to list their products online while customers can browse and purchase from multiple local vendors in one place.

## 🚀 Features

### For Customers
- Browse products from multiple local vendors
- Advanced search and category filtering
- Shopping cart with quantity management
- Secure checkout process
- Order tracking and history

### For Shopkeepers
- Create and manage online shop
- Add, edit, and delete products
- Manage inventory and orders
- Track sales and earnings
- 1 month free trial, then ₹299/month subscription

### For Administrators
- Platform statistics dashboard
- User management (activate/deactivate accounts)
- Commission tracking and reports
- Order oversight

## 💰 Revenue Model

- **Transaction Fee**: 3% per order
- **Shopkeeper Subscription**: ₹299/month (with 1 month free trial)

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router v6
- Axios
- Vite
- Modern CSS with Glassmorphism

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/Fastcom.git
cd Fastcom
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Environment Variables**

Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/fastcom
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=development
TRANSACTION_FEE_PERCENT=3
SUBSCRIPTION_FEE=299
```

## 🚦 Running the Application

**Backend** (runs on http://localhost:5000):
```bash
cd backend
npm start
```

**Frontend** (runs on http://localhost:5173):
```bash
cd frontend
npm run dev
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Shopkeeper only)
- `PUT /api/products/:id` - Update product (Shopkeeper only)
- `DELETE /api/products/:id` - Delete product (Shopkeeper only)

### Orders
- `POST /api/orders` - Create order (Customer only)
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/shop-orders` - Get shopkeeper orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-status` - Activate/deactivate user
- `PUT /api/admin/users/:id/subscription` - Update subscription
- `GET /api/admin/commission-report` - Commission report
- `GET /api/admin/orders` - Get all orders

## 👥 User Roles

1. **Customer** - Browse and purchase products
2. **Shopkeeper** - Manage online shop and products
3. **Admin** - Platform management and oversight

## 🎨 Design Features

- Dark mode with vibrant gradients
- Glassmorphism effects
- Smooth animations and transitions
- Fully responsive design
- Modern card-based layouts

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@fastcom.com or open an issue in this repository.

---

Built with ❤️ using the MERN stack
>>>>>>> a13c284 (Initial commit: FastCom MERN e-commerce platform with backend models, routes, and frontend structure)
