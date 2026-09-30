# Oven Xpress — Customer Application

> **This repository is the Oven Xpress Customer Application.**
>
> It is responsible exclusively for the customer-facing food ordering experience, including restaurant discovery, branch selection, menu browsing, cart management, checkout, live order tracking, and customer account management.
>
> Internal restaurant operations (Owner, Branch Manager, Kitchen Display System, Staff POS, Inventory, and Purchasing) are managed in the companion repository: **`Oven_Xpress`**.

## 🏗️ Project Structure

```
OvenXpress/
├── Client/                    # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/         # React contexts (Auth, Cart)
│   │   ├── lib/              # API client and utilities
│   │   ├── pages/            # Page components
│   │   └── assets/           # Static assets
│   ├── public/              # Public assets
│   └── package.json
│
├── backend/                  # Node.js Express backend
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── validators/      # Input validation
│   │   └── server.js        # Main server file
│   └── package.json
│
├── deployment/               # AWS deployment configs
│   ├── aws/                # AWS-specific configurations
│   └── docker/             # Docker configurations
│
├── docker-compose.yml       # Docker Compose configuration
└── README.md
```

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI/UX** with Tailwind CSS and shadcn/ui components
- **Authentication System** with JWT tokens
- **Shopping Cart** with real-time updates
- **Menu Management** with categories and search
- **Order Tracking** with real-time status updates
- **Responsive Design** for mobile and desktop
- **Real-time Updates** using Socket.io

### Backend (Node.js + Express)
- **RESTful API** with proper error handling
- **Authentication & Authorization** with JWT
- **Database Models** for Users, Menu Items, and Orders
- **Real-time Communication** with Socket.io
- **File Upload** support for images
- **Payment Integration** ready for Stripe
- **Email Notifications** for order updates
- **Rate Limiting** and security middleware

### Database (MongoDB)
- **User Management** with roles and preferences
- **Menu Items** with categories, ratings, and nutrition info
- **Order Management** with status tracking
- **Search Functionality** with text indexing

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **React Router** for navigation
- **Socket.io Client** for real-time updates

### Backend
- **Node.js 18** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Joi** for input validation
- **Helmet** for security
- **Rate Limiting** for API protection

### Deployment
- **Docker** for containerization
- **AWS EC2** for hosting
- **AWS S3** for file storage
- **CloudFormation** for infrastructure
- **PM2** for process management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (optional)
- AWS CLI (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ovenxpress.git
   cd ovenxpress
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd Client
   npm install
   cp env.local .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the connection string in backend/.env

### Docker Development

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 🚀 AWS Deployment

### Prerequisites
- AWS CLI configured
- EC2 Key Pair created
- Domain name (optional)

### Quick Deployment

1. **Run the deployment script**
   ```bash
   chmod +x deployment/aws/deploy.sh
   ./deployment/aws/deploy.sh
   ```

2. **Manual CloudFormation deployment**
   ```bash
   aws cloudformation deploy \
     --template-file deployment/aws/cloudformation-template.yaml \
     --stack-name ovenxpress-stack \
     --capabilities CAPABILITY_IAM
   ```

### Environment Configuration

1. **Backend Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb://your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_S3_BUCKET=your-s3-bucket-name
   ```

2. **Frontend Environment Variables**
   ```env
   VITE_API_URL=https://your-domain.com/api
   VITE_SOCKET_URL=https://your-domain.com
   ```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID
- `GET /api/menu/categories` - Get menu categories
- `GET /api/menu/featured` - Get featured items

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Admin)

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcrypt
- **Input Validation** with Joi schemas
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Helmet** for security headers
- **SQL Injection Protection** with parameterized queries

## 📱 Real-time Features

- **Order Status Updates** in real-time
- **Kitchen Dashboard** for order management
- **Live Notifications** for order updates
- **WebSocket Connection** for instant updates

## 🎨 UI/UX Features

- **Responsive Design** for all devices
- **Dark/Light Mode** support
- **Accessibility** compliant components
- **Loading States** and error handling
- **Smooth Animations** and transitions
- **Mobile-First** approach

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd Client
npm test
```

## 📊 Monitoring & Logging

- **PM2** for process management
- **Morgan** for HTTP request logging
- **Error Handling** with detailed logs
- **Health Check** endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: your-email@example.com

## 🔄 Version History

- **v1.0.0** - Initial release with full-stack functionality
- **v1.1.0** - Added real-time features and AWS deployment
- **v1.2.0** - Enhanced UI/UX and performance optimizations

---

**Built with ❤️ by [Shubham Kumar Chaurasia]**
<!-- add a line which say if you like this project please star this project  -->