const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const googleAuthRoutes = require("./routes/googeAuth");
const fareRoutes = require("./routes/fairRoute.js");
const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const rideRoutes = require("./routes/ride.routes");
const Razorpayorders = require("./routes/payment.routes");
const Verifypayment = require("./routes/verify.routes");
const testEmailRoute = require("./routes/testEmail");
const solanaRoutes = require("./routes/solana.routes");

const connectTodb = require("./db/db");
connectTodb();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ---------------- API ROUTES (FIRST) ----------------
app.use("/users", userRoutes);
app.use("/captains", captainRoutes);
app.use("/rides", rideRoutes);
app.use("/auth", googleAuthRoutes);
app.use("/api/fare", fareRoutes);
app.use("/api", testEmailRoute);
app.use("/create-orders", Razorpayorders);
app.use("/verify", Verifypayment);
app.use("/solana", solanaRoutes);

// ---------------- FRONTEND (LAST) ----------------
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all handler: must be last route (Express 5.x requires named parameter for wildcards)
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

module.exports = app;
