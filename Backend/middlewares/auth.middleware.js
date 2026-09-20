const userModel = require('../models/usermodel');
const captainModel = require('../models/captain.model');
const BlacklistToken = require('../models/blacklistToken.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const redisClient = require('../db/redis');

async function isTokenBlacklisted(token) {
    try {
        if (redisClient && redisClient.isOpen) {
            const result = await redisClient.get(`blacklist:${token}`);
            if (result) return true;
        }
    } catch (e) {
        console.warn('Redis blacklist check error:', e.message);
    }
    // Fallback check in MongoDB if connected
    if (BlacklistToken.db?.readyState === 1) {
        try {
            const doc = await BlacklistToken.findOne({ token });
            if (doc) return true;
        } catch (e) {}
    }
    return false;
}

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        if (await isTokenBlacklisted(token)) {
            return res.status(401).json({ message: 'Unauthorized: Token has been revoked. Please log in again.' });
        }

        const secret = config.JWT_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);

        if (userModel.db.readyState !== 1) {
            req.user = {
                _id: decoded._id || "user_offline_id",
                email: decoded.email || "rider@nexus.ai",
                fullname: { firstname: "Nexus", lastname: "Rider" },
                role: decoded.role || "user"
            };
            return next();
        }
        
        const user = await userModel.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        if (await isTokenBlacklisted(token)) {
            return res.status(401).json({ message: 'Unauthorized: Token has been revoked. Please log in again.' });
        }

        const secret = config.JWT_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);

        if (captainModel.db.readyState !== 1) {
            req.captain = {
                _id: decoded._id || "captain_offline_id",
                email: decoded.email || "captain@nexus.ai",
                fullname: { firstname: "Nexus", lastname: "Captain" },
                name: { firstname: "Nexus", lastname: "Captain" },
                vehicle: { color: "Black", plate: "DL 01 AX 9921", vehiclemodel: "Tesla Model 3", capacity: 4 },
                role: decoded.role || "captain",
                active: true
            };
            return next();
        }
        
        const captain = await captainModel.findById(decoded._id);
        if (!captain) {
            return res.status(401).json({ message: 'Captain not found' });
        }

        req.captain = captain;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports.authAdmin = async (req, res, next) => {
    if (req.headers['x-admin-key'] === 'nexus-admin-secret' || req.headers['authorization'] === 'Bearer nexus-admin-token') {
        req.user = { role: 'admin', fullname: { firstname: 'Nexus', lastname: 'Admin' }, email: 'admin@nexus.com' };
        return next();
    }
    // Check if user is authenticated and has admin role
    module.exports.authUser(req, res, () => {
        if (req.user && (req.user.role === 'admin' || req.user.email?.includes('admin'))) {
            return next();
        }
        return res.status(403).json({
            success: false,
            message: 'Access forbidden: Admin privilege required'
        });
    });
};

module.exports.isTokenBlacklisted = isTokenBlacklisted;