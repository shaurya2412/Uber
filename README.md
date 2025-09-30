# Uber Clone (Full Stack)

A full‑stack Uber‑like application with separate roles for riders (users) and drivers (captains). Backend is Node.js/Express with MongoDB; frontend is React (Vite) with Zustand state.

## Quick Start

- Backend: `Backend/`
- Frontend: `Uber-frontend/uberfrontend/`

### Prerequisites
- Node.js 18+
- MongoDB running locally or in the cloud

### 1) Backend setup
```bash
cd Backend
npm install
# Create .env
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/uber
# JWT_SECRET=your-secret-key
npm run dev   # or: npm start
```
Backend default: `http://localhost:5000`

### 2) Frontend setup
```bash
cd Uber-frontend/uberfrontend
npm install
npm run dev
```
Frontend default: `http://localhost:5173`

## Architecture
- Backend: Express, Mongoose, JWT, express-validator
- Frontend: React, Vite, React Router, Zustand, Axios, Tailwind (styles), Leaflet (maps-ready)
- Auth: JWT stored in `localStorage` on the client; sent as `Authorization: Bearer <token>`

## Environment Variables

Backend (`Backend/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uber
JWT_SECRET=your-secret-key
```

Frontend (`Uber-frontend/uberfrontend/.env`):
```
VITE_API_BASE_URL=http://localhost:5000
# Optional if using Google/Map services
VITE_GOOGLE_MAPS_API_KEY=your_key
```

## Run Scripts

Backend (from `Backend/`):
- `npm run dev`: start with nodemon
- `npm start`: start production server

Frontend (from `Uber-frontend/uberfrontend/`):
- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview build

## Backend API Overview
Base URL: `http://localhost:5000`

Authentication uses JWT. Middleware reads token from cookie or `Authorization` header.

### Users (`/users`)
- POST `/register` body: `{ fullname:{firstname,lastname}, email, password }` → `{ token, user }`
- POST `/login` body: `{ email, password }` → `{ token, user }`
- GET `/profile` auth: user → returns current user

### Captains (`/captains`)
- POST `/register` body: `{ name:{firstname,lastname}, email, password, vehicle:{ color, plate, vehiclemodel, capacity } }` → `{ captaintoken, captain }`
- POST `/login` body: `{ email, password }` → `{ captaintoken, captain }`
- GET `/profile` auth: captain → `{ success, captain }`
- PUT `/status` auth: captain body: `{ active: boolean }` → `{ success, captain }`

### Rides (`/rides`)
User actions (auth: user):
- POST `/book` body:
  ```json
  {
    "pickup": { "address": "...", "coordinates": { "lat": 0, "lng": 0 } },
    "destination": { "address": "...", "coordinates": { "lat": 0, "lng": 0 } },
    "fare": 123
  }
  ```
- GET `/user-current` → current ride in `pending|accepted|in_progress`
- GET `/user-history?page=&limit=` → completed rides
- POST `/:rideId/cancel` → cancel `pending|accepted`

Captain actions (auth: captain):
- GET `/available` → pending rides
- POST `/:rideId/accept` → claim a pending ride (one active ride per captain)
- POST `/:rideId/start` → move `accepted` → `in_progress`
- POST `/:rideId/complete` → move `in_progress` → `completed`
- PUT `/:rideId/location` body `{ lat, lng }` → update current location
- GET `/current` → current `accepted|in_progress` ride
- GET `/history?page=&limit=` → completed rides

Validation via `express-validator` on emails, passwords, coordinates, required fields. Standard HTTP codes: 400 validation, 401 auth, 404 not found, 500 server error.

## Data Models (Mongoose)
- User: `fullname { firstname, lastname }`, `email`, `password`, methods `generateAuthToken`, `comparePassword`
- Captain: `fullname`, `email`, `password`, `active`, `vehicle { color, plate, vehiclemodel, capacity, location }`
- Ride: refs `user`, `captain`, `pickup`, `destination`, `fare`, `status (pending|accepted|in_progress|completed|cancelled)`, timestamps

## Frontend Overview
Routing (`src/Routes.jsx`):
- `/` → LaunchPage
- `/login` → Login (user)
- `/dashboard` → ProtectedRoute(User) → Dashboard
- `/captainlogin` → CaptainLogin
- `/captainRegister` → Captain registration
- `/capdashboard` → Captain dashboard (wrap with `CaptainProtectedRoute` if restricting access)

Guards:
- `ProtectedRoute` (user): checks `localStorage.token`, fetches `/users/profile` to verify
- `CaptainProtectedRoute`: verifies `localStorage.captaintoken` via `/captains/profile`

State (Zustand):
- `useUserStore`: user auth, profile; persists `token` in `localStorage`
- `useCaptainStore`: captain auth, `active` toggle, available/current/history rides
- `useRideStore`: user ride booking, current ride, history, status

## Typical Flows
- User login → token saved → access `/dashboard` → book ride → captain accepts → ride progresses to complete → appears in history
- Captain login → token saved → set `active` → fetch available rides → accept/start/complete ride → history updates

## Notes
- Ports: Backend 5000, Frontend 5173
- Ensure CORS is enabled in backend for the frontend origin
- Update API base URL in frontend `.env` if backend port/host differs

## Troubleshooting
- Backend not starting: check `.env` and MongoDB connection
- 401 errors: verify `Authorization: Bearer <token>` header and token presence
- Frontend cannot reach backend: confirm ports, CORS, and `VITE_API_BASE_URL`


      - Backend README: `Backend/README.md`
- Frontend README: `Uber-frontend/uberfrontend/README.md`

