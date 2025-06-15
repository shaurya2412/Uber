const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const cors = require("cors");

const connectTodb = require('./db/db');
connectTodb();
const app = express();
app.use(cors());

app.get("/", (req,res)=>{
    res.send("hello world")
})

module.exports= app;