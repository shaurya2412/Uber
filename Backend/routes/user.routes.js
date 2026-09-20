const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");

router.post("/register", authLimiter, (req, res, next) => {
    if (!req.body.fullname && req.body.name) {
        if (typeof req.body.name === 'object') {
            req.body.fullname = req.body.name;
        } else if (typeof req.body.name === 'string') {
            const parts = req.body.name.trim().split(' ');
            req.body.fullname = { firstname: parts[0], lastname: parts.slice(1).join(' ') || 'User' };
        }
    }
    if (req.body.fullname && !req.body.fullname.lastname) {
        req.body.fullname.lastname = 'User';
    }
    next();
}, [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({min: 3}).withMessage('FirstName name must be atleast 3 characters long'),
    body('fullname.lastname').isLength({min: 1}).withMessage('LastName is required'),
    body('password').isLength({min:6}).withMessage('Password must be atleast 6 characters long')
], userController.registerUser);

router.post("/login", authLimiter, [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:6}).withMessage('Password must be atleast 6 characters long')
], userController.loginUser);

router.post("/refresh-token", userController.refreshToken);
router.post("/logout", authMiddleware.authUser, userController.logoutUser);
router.get('/profile', authMiddleware.authUser, userController.getUserprofile);

module.exports = router;