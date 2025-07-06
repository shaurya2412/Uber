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
   PORT=3000
   DB_CONNECT=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   ```
4. **Start the server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000` by default.

---

## Environment Variables
- `PORT`: Port number for the server (default: 3000)
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

---

## Authentication
- Uses JWT (JSON Web Tokens) for authentication.
- On successful login/registration, a JWT is returned in the response.
- For protected routes, send the JWT in the `Authorization: Bearer <token>` header or as a `token` cookie.
- Tokens can be blacklisted (see `blacklistToken.model.js.js`).

---

## Models

### User Model (`models/usermodel.js`)
- `fullname`: `{ firstname: String, lastname: String }`
- `email`: String (unique)
- `password`: String (hashed, not returned by default)
- `sockerId`: String (optional)

### Captain Model (`models/captain.model.js`)
- `fullname`: `{ firstname: String, lastname: String }`
- `email`: String (unique)
- `password`: String (hashed, not returned by default)
- `socketId`: String (optional)
- `status`: 'active' | 'inactive'
- `vehicle`: `{ color, plate, vehiclemodel, capacity, location: { lat, lng } }`

---

## Error Handling
- Validation errors return HTTP 400 with details.
- Auth errors return HTTP 401.
- All errors are returned as JSON.

---

## Contact
For questions or support, contact the backend team. 