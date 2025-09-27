const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const googleAuthRoutes = require("./routes/googeAuth");
const fareRoutes = require("./routes/fairRoute.js")
const cors = require("cors");
const userRoutes = require("./routes/user.routes")
const captainRoutes = require("./routes/captain.routes")
const rideRoutes = require("./routes/ride.routes")
const connectTodb = require('./db/db');
connectTodb();
const app = express();
app.use(cors());
const cookieParser = require("cookie-parser");

app.use(express.json());
 
app.use(cookieParser());

app.get("/", (req,res)=>{
    res.send("hello world")
})
app.use('/users',userRoutes);
app.use("/captains", captainRoutes);
app.use("/rides", rideRoutes);
app.use("/auth", googleAuthRoutes);
app.use("/calculate", fareRoutes);

module.exports= app;