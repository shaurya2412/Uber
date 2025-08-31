const userModel = require('../models/usermodel');
const captainModel = require('../models/captain.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports.authUser = async (req, res, next) => {
    console.log('Auth User - Headers:', req.headers.authorization);
    console.log('Auth User - Cookies:', req.cookies.token);
    
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    console.log('Extracted token:', token ? 'EXISTS' : 'MISSING');

    if (!token) {
        console.log('No token found');
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        console.log('🔐 JWT_SECRET exists:', config.JWT_SECRET ? 'YES' : 'NO');
        const decoded = jwt.verify(token, config.JWT_SECRET);
        console.log('Token decoded:', decoded);
        
        const user = await userModel.findById(decoded._id);
        console.log('👤 User found:', user ? 'YES' : 'NO');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        return next();

    } catch (err) {
        console.log('JWT verification error:', err.message);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports.authCaptain = async (req, res, next) => {
    console.log('AUTH CAPTAIN MIDDLEWARE CALLED');
    console.log('Headers:', req.headers.authorization);
    console.log('Cookies:', req.cookies.token);
    
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    console.log('🎫 Extracted token:', token ? 'EXISTS' : 'MISSING');

    if (!token) {
        console.log('No token found');
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        console.log('JWT_SECRET exists:', config.JWT_SECRET ? 'YES' : 'NO');
        const decoded = jwt.verify(token, config.JWT_SECRET);
        console.log('Token decoded:', decoded);
        
        const captain = await captainModel.findById(decoded._id);
        console.log('Captain found:', captain ? 'YES' : 'NO');
        
        if (!captain) {
            return res.status(401).json({ message: 'Captain not found' });
        }
        
        req.captain = captain;
        return next();
        
    } catch (err) {
        console.log('❌ JWT verification error:', err.message);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}