const userModel = require('../models/usermodel');
const captainModel = require('../models/captain.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



module.exports.authUser = async (req, res, next) => {
    console.log( req.headers.authorization);
    console.log( req.cookies.token);
    
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];
    console.log(' Extracted token:', token ? 'EXISTS' : 'MISSING');

    if (!token) {
        console.log(' No token found');
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        console.log('🔐 JWT_SECRET exists:', process.env.JWT_SECRET ? 'YES' : 'NO');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(' Token decoded:', decoded);
        
        const user = await userModel.findById(decoded._id)
        console.log('👤 User found:', user ? 'YES' : 'NO');

        req.user = user;

        return next();

    } catch (err) {
        console.log('JWT verification error:', err.message);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports.authCaptain = async (req, res, next) => {
    console.log(' AUTH CAPTAIN MIDDLEWARE CALLED');
    console.log(' Headers:', req.headers.authorization);
    console.log(' Cookies:', req.cookies.token);
    
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];
    console.log('🎫 Extracted token:', token ? 'EXISTS' : 'MISSING');

    if (!token) {
        console.log(' No token found');
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        console.log(' JWT_SECRET exists:', process.env.JWT_SECRET ? 'YES' : 'NO');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(' Token decoded:', decoded);
        
        const captain = await captainModel.findById(decoded._id)
        console.log(' Captain found:', captain ? 'YES' : 'NO');
        
        req.captain = captain;
 
        return next()
    } catch (err) {
        console.log('❌ JWT verification error:', err.message);
        res.status(401).json({ message: 'Unauthorized' });
    }
}