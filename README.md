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
