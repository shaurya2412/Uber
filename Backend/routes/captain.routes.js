const express = require("express");
const router = express.Router();
const {body} = require("express-validator");
const captainController = require("../controllers/captain.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register", [
    body("name.firstname").isLength({min:3}).withMessage('Firstname should be at least 3 characters'),
    body("name.lastname").isLength({min:2}).withMessage('Lastname should be at least 2 characters'),
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:3}).withMessage('Password should be at least 3 characters'),
    body("vehicle.color").isString().withMessage('Color of the vehicle should have at least 3 characters'),
    body("vehicle.plate").isString().withMessage('The plate should have 10 characters'),
    body("vehicle.vehiclemodel").isString().withMessage("Giving the model of vehicle is compulsory"),
    body("vehicle.capacity")
        .isString()
        .isLength({ min: 1 })
        .withMessage("Vehicle capacity is required"),
], captainController.registerCaptain);

router.post("/login", [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:3}).withMessage('Password should be at least 3 characters')
], captainController.loginCaptain);

router.get('/profile', authMiddleware.authCaptain, captainController.getCaptainProfile);
router.put('/status', authMiddleware.authCaptain, captainController.updateCaptainStatus);

module.exports = router;