const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes")
const connectTodb = require('./db/db');
connectTodb();
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get("/", (req,res)=>{
    res.send("hello world")
})
app.use('/users',userRoutes);
app.use("/login", userRoutes)

module.exports= app;