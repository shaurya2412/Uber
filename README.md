# 🚗 Uber Clone Project Documentation

A full-stack ride-sharing application built with Node.js backend and React frontend.

## 🎯 Overview

This is a ride-sharing application similar to Uber, with separate interfaces for:
- **Users**: Book rides, view ride history, manage profile
- **Captains**: Accept rides, navigate to destinations, manage earnings
- **Admin**: Monitor system, manage users and captains

## ✨ Features

### For Users
- User registration and authentication
- Book rides with pickup/dropoff locations
- Real-time ride tracking
- Ride history and ratings
- Profile management

### For Captains
- Captain registration and authentication
- Accept/reject ride requests
- Navigation and route optimization
- Earnings tracking
- Ride completion

### General Features
- JWT-based authentication
- Real-time updates
- Interactive maps
- Responsive design

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Redis** - Caching

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Zustand** - State management
- **Leaflet** - Maps
- **Axios** - HTTP client

## 📁 Project Structure

```
Uber/
├── Backend/                 # Node.js server
│   ├── controllers/        # Request handlers
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middlewares/       # Authentication & validation
│   ├── services/          # Business logic
│   └── db/               # Database connection
└── Uber-frontend/         # React application
    └── uberfrontend/
        └── src/
            ├── components/     # Reusable UI components
            ├── captainroutes/  # Captain-specific pages
            ├── Zustand/        # State management
            └── assets/         # Images and static files
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Redis (optional, for caching)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create `.env` file with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/uber-clone
   JWT_SECRET=your-secret-key
   ```

4. **Start the server:**
   ```bash
   npm run dev    # Development mode
   npm start      # Production mode
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Uber-frontend/uberfrontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:5173`

## 🔌 API Endpoints

### Authentication
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `POST /captains/register` - Captain registration
- `POST /captains/login` - Captain login

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/rides` - Get user ride history

### Captains
- `GET /captains/profile` - Get captain profile
- `PUT /captains/profile` - Update captain profile
- `GET /captains/rides` - Get captain ride history

### Rides
- `POST /rides/book` - Book a new ride
- `GET /rides/available` - Get available rides
- `PUT /rides/:id/accept` - Accept a ride
- `PUT /rides/:id/complete` - Complete a ride
- `GET /rides/:id` - Get ride details

## 🗺️ Frontend Routes

- `/` - Landing page
- `/login` - User login
- `/Welcome` - Welcome page
- `/dashboard` - User dashboard
- `/captainlogin` - Captain login
- `/captainRegister` - Captain registration
- `/capdashboard` - Captain dashboard

## 🗄️ Database Models

### User Model
- Basic info (name, email, phone)
- Authentication details
- Ride preferences

### Captain Model
- Personal information
- Vehicle details
- Current status and location
- Earnings and ratings

### Ride Model
- Pickup and dropoff locations
- User and captain references
- Ride status and timestamps
- Pricing and payment info

## 🔐 Authentication

The app uses JWT (JSON Web Tokens) for secure authentication:

1. **Login/Register** → Get JWT token
2. **Protected routes** → Include token in headers
3. **Token validation** → Middleware checks token validity

## 🗺️ Maps Integration

- **Leaflet.js** for interactive maps
- Real-time location tracking
- Route visualization
- Pickup/dropoff markers

## 📱 State Management

**Zustand** is used for state management with three main stores:
- `useUserStore` - User data and authentication
- `useCaptainStore` - Captain data and status
- `useRideStore` - Ride booking and tracking

## 🚦 Available Scripts

### Backend
- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔧 Configuration

Key configuration files:
- `Backend/config.js` - Server and database settings
- `Backend/.env` - Environment variables
- `Uber-frontend/uberfrontend/vite.config.js` - Vite configuration

## 📝 Notes

- The backend runs on port 5000 by default
- Frontend runs on port 5173 (Vite default)
- MongoDB connection is established automatically
- CORS is enabled for frontend-backend communication

## 🆘 Troubleshooting

**Common Issues:**
1. **Port already in use** → Change PORT in .env
2. **MongoDB connection failed** → Check MongoDB service
3. **Frontend can't connect to backend** → Verify backend is running and CORS is configured

**Need Help?**
- Check console logs for error messages
- Verify all dependencies are installed
- Ensure environment variables are set correctly
