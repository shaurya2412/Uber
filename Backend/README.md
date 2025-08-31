# Uber Clone Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/uber_clone
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_IN=7
```

### 3. Database Setup
Make sure MongoDB is running on your system. The default connection string is:
```
mongodb://localhost:27017/uber_clone
```

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Rides
- `POST /rides/book` - Book a new ride
- `GET /rides/user-current` - Get user's current ride
- `GET /rides/user-history` - Get user's ride history

### Users
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `GET /users/profile` - Get user profile

### Captains
- `POST /captains/register` - Captain registration
- `POST /captains/login` - Captain login
- `GET /captains/profile` - Get captain profile

## Dependencies

- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **cookie-parser** - Cookie parsing

## Port Configuration

The backend runs on port 3000 by default. Make sure your frontend is configured to connect to `http://localhost:3000`. 