const express = require("express");
const router = express.Router();
const {body} = require("express-validator");

router.post("/register", [
    body("name.firstname").isLength({min:3}).withMessage('Password should be at least 4 characters'),
    body("name.lastname").isLength({min:4}).withMessage('lastname should be of atleast 3 charaters'),
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:3}).withMessage('Password should be of atleast 3 characters'),
    body("vehicle.color").isString().withMessage('color of the vehicle shuld have atleast 3 characters'),
    body("vehicle.plate").isString().withMessage('The plate should have 10 characters'),
    body("vehicle.vehiclemodel").isString().withMessage("Giving the model of vehicle is compalsory"),
   body("vehicle.capacity")
    .isString()
    .isLength({ min: 1 })
    .withMessage("Vehicle capacity is required"),

])



module.exports = router;