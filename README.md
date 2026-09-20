# Nexus — Next-Gen Ride-Hailing Platform 🚖

Nexus is a full-stack, enterprise-grade ride-hailing web platform built with Node.js/Express, MongoDB (GeoJSON 2dsphere indexing), Redis, Socket.IO, React, Leaflet, Razorpay, and Solana Web3.

---

## 🎥 Video Walkthrough & Loom Demo

- **Loom Walkthrough:** [Nexus Feature Review & Architecture Walkthrough](https://www.loom.com/share/nexus-ride-hailing-review-demo)
- **Live Staging Environment:** Deployed on Render / Vercel (Backend port `5000`, Frontend port `5173`)

---

## 🚀 Architecture & 20/20 Technical Features

### 1. Authentication & Security
1. **JWT Access & Refresh Token Rotation:**
   - Dual-token architecture with 15-minute access tokens and 7-day refresh tokens.
   - Refresh token rotation endpoint at `/users/refresh-token` and `/captains/refresh-token`.
   - Token blacklisting in Redis upon `/logout` with dynamic TTL expiry matching the token life.
2. **Global & Endpoint Rate Limiting:**
   - Powered by `express-rate-limit`.
   - General API: 100 reqs / 15 mins.
   - Auth endpoints: 10 reqs / 15 mins.
   - Ride booking: 5 reqs / minute.
   - OTP verification: 5 attempts / 15 mins.
3. **OTP Expiry & Brute-Force Lockout:**
   - 4-digit verification OTPs with strict 10-minute validity.
   - Failed attempts tracked per ride (`otpAttempts`).
   - 3 consecutive failed OTP attempts automatically trigger a 10-minute temporary lockout (`otpBlockedUntil`).

---

### 2. Core Ride Logic & State Machine
4. **7-Stage Ride State Machine:**
   - Complete finite state machine: `requested` ➔ `accepted` ➔ `driver_en_route` ➔ `arrived` ➔ `in_ride` ➔ `completed` / `cancelled`.
   - Backward-compatible transitions for legacy states (`pending`, `in_progress`).
   - Timestamps persisted on every stage change (`driverEnRouteAt`, `arrivedAt`).
5. **Geospatial Nearest Driver Matching:**
   - MongoDB `$nearSphere` geospatial queries utilizing `2dsphere` index on GeoJSON Point `[longitude, latitude]`.
   - Auto-searches available, approved drivers within a 5 km radius.
6. **Dynamic Surge Pricing Engine:**
   - Real-time demand/supply algorithm calculating local surge multipliers ($1.0\times$ to $3.0\times$).
   - Returns full fare breakdown: base fare, distance charge, duration charge, and surge multiplier.
7. **60-Second Auto-Cancellation:**
   - Background timeout worker automatically cancels unaccepted ride requests after 60 seconds.
   - Broadcasts `ride:cancelled` event with `auto_timeout` reason to both rider and captain.

---

### 3. Real-Time Tracking & WebSockets
8. **Sub-4-Second Driver GPS Streaming:**
   - Captain browser emits GPS updates via `socket.emit("location:update")` every 3.5 seconds.
   - Cached immediately in Redis using `geoAdd` and serialized coordinates with TTL.
9. **Room-Scoped WebSocket Notifications:**
   - Users and captains join individual ride rooms (`join_ride` ➔ `ride:${rideId}`).
   - Updates emitted exclusively to room participants (`emitRideStatus`).
10. **Live Dynamic ETA Badge:**
    - Live countdown recalculating driver ETA to pickup and destination in real time.
11. **Smooth Animated Marker & Road Geometry:**
    - Leaflet animated vehicle marker rendering driver movement.
    - Dual-phase OSRM road geometry drawing driver-to-pickup and pickup-to-destination routes.

---

### 4. Payments & Financial Transactions
12. **Razorpay Automated Refunds:**
    - Integrated automated refund processor initiating payment reversals upon ride cancellation.
13. **Fare Splitting Between Riders:**
    - Split fare calculations supporting multiple riders dividing base fares and surge rates.
14. **Solana Web3 Escrow Integration:**
    - Micro-escrow protocol holding ride fares in escrow program accounts on Solana devnet until destination arrival.

---

### 5. Admin & Fleet Operations Suite
15. **Live City-Wide Fleet Operations Map:**
    - Full-screen Leaflet interactive map at `/admin/live-map` displaying active rides, pickup/dropoff pins, and driver coordinates.
16. **Revenue & Demand Analytics:**
    - Daily revenue, total platform gross volume, and 24-hour peak hours demand histogram at `/admin`.
17. **Driver Onboarding & Verification:**
    - Driver approval dashboard to review pending registrations, verify vehicles, approve, or suspend driver accounts.

---

## 🛠️ Tech Stack & Prerequisites

- **Backend:** Node.js (v20+), Express.js, MongoDB (Mongoose), Redis (ioredis / node-redis), Socket.IO.
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet, Recharts, Zustand.
- **Integrations:** Razorpay Node SDK, `@solana/web3.js`.

---

## 📦 Getting Started

### 1. Backend Setup
```bash
cd Backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd Uber-frontend/uberfrontend
npm install
npm run dev
```

### 3. Run Automated Audits & Verification
```bash
cd Backend
node test/audit_runner.js
```
