# Uber Backend API Documentation

## Overview
This is the backend for the Uber-like application. It provides RESTful APIs for user and captain (driver) registration, authentication, and profile management. The backend is built with Node.js, Express, and MongoDB (via Mongoose).

---

## Table of Contents
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
  - [User APIs](#user-apis)
  - [Captain APIs](#captain-apis)
- [Authentication](#authentication)
- [Models](#models)
- [Error Handling](#error-handling)
- [Contact](#contact)

---

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the `Backend` directory with the following variables:
   ```env
   PORT=5000
   DB_CONNECT=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   ```
4. **Start the server:**
   ```bash
   npm start
   # or
   npm run dev
   ```
   The server will run on `http://localhost:5000` by default.

---

## Environment Variables
- `PORT`: Port number for the server (default: 5000)
- `DB_CONNECT`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication

---

## Project Structure
```
Backend/
├── app.js                # Express app setup and routes
├── index.js              # Server entry point
├── db/
│   └── db.js             # MongoDB connection logic
├── routes/
│   ├── user.routes.js    # User-related API routes
│   └── captain.routes.js # Captain-related API routes
├── controllers/
│   ├── user.controller.js
│   └── captain.controller.js
├── models/
│   ├── usermodel.js      # User schema/model
│   ├── captain.model.js  # Captain schema/model
│   └── blacklistToken.model.js.js # Blacklisted JWTs
├── services/
│   ├── user.service.js   # User business logic
│   └── captain.service.js# Captain business logic
├── middlewares/
│   └── auth.middleware.js# Auth middleware
└── package.json
```

---

## API Endpoints

### User APIs
Base URL: `/users`

| Method | Endpoint      | Description                | Auth Required | Body Params |
|--------|--------------|----------------------------|---------------|-------------|
| POST   | /register    | Register a new user        | No            | `{ fullname: { firstname, lastname }, email, password }` |
| POST   | /login       | Login as a user            | No            | `{ email, password }` |
| GET    | /profile     | Get logged-in user profile | Yes (JWT)     | -           |

#### Example: Register User
```json
POST /users/register
{
  "fullname": { "firstname": "John", "lastname": "Doe" },
  "email": "john@example.com",
  "password": "yourpassword"
}
```

#### Example: Login User
```json
POST /users/login
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

#### Example: Get Profile
- Send JWT in `Authorization: Bearer <token>` header or as a `token` cookie.

---

### Captain APIs
Base URL: `/captains`

| Method | Endpoint      | Description                | Auth Required | Body Params |
|--------|--------------|----------------------------|---------------|-------------|
| POST   | /register    | Register a new captain     | No            | `{ name: { firstname, lastname }, email, password, vehicle: { color, plate, vehiclemodel, capacity } }` |
| POST   | /login       | Login as a captain         | No            | `{ email, password }` |
| GET    | /profile     | Get logged-in captain profile | Yes (JWT)  | -           |

#### Example: Register Captain
```json
POST /captains/register
{
  "name": { "firstname": "Jane", "lastname": "Smith" },
  "email": "jane@example.com",
  "password": "yourpassword",
  "vehicle": {
    "color": "Black",
    "plate": "ABC1234567",
    "vehiclemodel": "Toyota Prius",
    "capacity": "4"
  }
}
```

#### Example: Login Captain
```json
POST /captains/login
{
  "email": "jane@example.com",
  "password": "yourpassword"
}
```

#### Example: Get Captain Profile
- Send JWT in `Authorization: Bearer <token>` header or as a `token` cookie.

---

## Validation Rules

### User Registration/Login
- `fullname.firstname`: Minimum 3 characters
- `fullname.lastname`: Minimum 3 characters  
- `email`: Valid email format
- `password`: Minimum 6 characters

### Captain Registration
- `name.firstname`: Minimum 3 characters
- `name.lastname`: Minimum 2 characters
- `email`: Valid email format
- `password`: Minimum 3 characters
- `vehicle.color`: String, minimum 3 characters
- `vehicle.plate`: String, minimum 10 characters
- `vehicle.vehiclemodel`: String, minimum 3 characters
- `vehicle.capacity`: String, minimum 1 character

### Captain Login
- `email`: Valid email format
- `password`: Minimum 3 characters

---

## Authentication
- Uses JWT (JSON Web Tokens) for authentication.
- On successful login/registration, a JWT is returned in the response.
- For protected routes, send the JWT in the `Authorization: Bearer <token>` header or as a `token` cookie.
- Tokens can be blacklisted (see `blacklistToken.model.js.js`).

### Response Format
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { /* user data */ }
  // or
  "captain": { /* captain data */ }
}
```

---

## Models

### User Model (`models/usermodel.js`)
- `fullname`: `{ firstname: String, lastname: String }`
- `email`: String (unique, lowercase)
- `password`: String (hashed, not returned by default)
- `sockerId`: String (optional)

### Captain Model (`models/captain.model.js`)
- `fullname`: `{ firstname: String, lastname: String }`
- `email`: String (unique, lowercase)
- `password`: String (hashed, not returned by default)
- `socketId`: String (optional)
- `status`: 'active' | 'inactive' (default: 'active')
- `vehicle`: `{ color, plate, vehiclemodel, capacity, location: { lat, lng } }`

---

## Dependencies
- **express**: ^5.1.0 - Web framework
- **mongoose**: ^8.15.2 - MongoDB ODM
- **bcrypt**: ^6.0.0 - Password hashing
- **jsonwebtoken**: ^9.0.2 - JWT authentication
- **express-validator**: ^7.2.1 - Input validation
- **cors**: ^2.8.5 - Cross-origin resource sharing
- **cookie-parser**: ^1.4.7 - Cookie parsing
- **dotenv**: ^16.5.0 - Environment variables
- **nodemon**: ^3.1.10 - Development server

---

## Error Handling
- Validation errors return HTTP 400 with detailed error array
- Authentication errors return HTTP 401
- All errors are returned as JSON with descriptive messages

### Error Response Format
```json
{
  "error": [
    {
      "type": "field",
      "value": "invalid-value",
      "msg": "Error message",
      "path": "field.path",
      "location": "body"
    }
  ]
}
```

---

## Development
- Server runs on port 5000 by default
- MongoDB connection is established on startup
- CORS is enabled for cross-origin requests
- Cookie parsing is enabled for token storage

---

## Contact
For questions or support, contact the backend team. 
