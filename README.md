# Uber Documentation and required information 
## Tech Stack
Backend: Express 5, Mongoose 8, JWT, bcrypt, cors, cookie-parser, express-validator, dotenv
Frontend: React 19, Vite 7, React Router 7, Zustand 5, Leaflet + React-Leaflet, Tailwind CSS 4

## Overview
This is the backend for the Uber-like application. It provides RESTful APIs for user and captain (driver) registration, authentication, and profile management. The backend is built with Node.js, Express, and MongoDB (via Mongoose).

Uber/
├─ Backend/                 # Express API + MongoDB
│  ├─ app.js                # Express app setup and routes
│  ├─ index.js              # Server entry point (http server)
│  ├─ db/                   # Database connection
│  ├─ controllers/          # Users, Captains, Rides controllers
│  ├─ routes/               # /users, /captains, /rides
│  ├─ middlewares/          # auth.middleware.js (JWT)
│  ├─ models/               # Mongoose models (users, captains, rides, blacklist)
│  ├─ services/             # Domain logic
│  └─ test-rides.js         # Ride scenario testing utility
└─ Uber-frontend/
   └─ uberfrontend/         # React app (Vite)
      ├─ src/
      │  ├─ Routes.jsx      # App routes
      │  ├─ components/     # UI components
      │  ├─ captainroutes/  # Captain auth/register screens
      │  └─ Zustand/        # useUserStore, useCaptainStore, useRideStore
      └─ vite.config.js     # Vite + Tailwind
Map & UI
Mapping: Leaflet + React-Leaflet
Styling: Tailwind CSS via Vite plugin
Scripts
Backend (Backend/package.json)
npm run dev → start server (watch) on PORT (default 3000, recommend 5000)
npm start → start server
Frontend (Uber-frontend/uberfrontend/package.json)
npm run dev → Vite dev server
npm run build → production build
npm run preview → preview production build
npm run lint → run ESLint
Configuration
Backend .env
PORT number (set to 5000 to match frontend)
DB_CONNECT MongoDB connection string
JWT_SECRET secret used to sign tokens
CORS and Cookies
Backend enables cors() and cookie-parser
Frontend sends JWT via Authorization header by default; cookie-based auth also supported
