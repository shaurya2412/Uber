const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const BlacklistToken = require('../models/blacklistToken.model');
const redisClient = require('../db/redis');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { validationResult } = require('express-validator');

module.exports.registerCaptain = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }

    try {
        const { name, email, password, vehicle, phonenumber } = req.body;
        const { firstname, lastname } = name;
        const { color, plate, vehiclemodel, capacity } = vehicle;

        const hashedPassword = await captainModel.hashPassword(password);

        const captain = await captainService.createCaptain({
            firstname,
            lastname,
            email,
            phonenumber: phonenumber || '',
            password: hashedPassword,
            color,
            plate,
            vehicleType: vehiclemodel,
            capacity,
            Modelname: vehiclemodel
        });
       
        const captaintoken = captain.generateAuthToken();
        const { accessToken, refreshToken } = captain.generateAuthTokens();

        res.status(201).json({
            captaintoken, // backward compatibility
            accessToken,
            refreshToken,
            captain
        });
    } catch (err) {
        if (err?.name === 'ValidationError') {
            console.log('📝 Mongoose validation errors:', err.errors);
            const errorArray = Object.values(err.errors).map(e => ({ msg: e.message }));
            return res.status(400).json({ error: errorArray });
        }
        if (err?.code === 11000) {
            console.log('📧 Duplicate email error');
            return res.status(400).json({ error: [{ msg: 'Email already registered' }] });
        }
        console.log('🔥 Unexpected error, returning 500:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.loginCaptain = async(req, res, next)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    
    const {email, password} = req.body;

    const captain = await captainModel.findOne({email}).select('+password');

    if(!captain){
        return res.status(401).json({message: "Invalid email or password"});
    }

    const isMatch = await captain.comparePassword(password);

    if(!isMatch){
        return res.status(401).json({message: "Invalid password, or network issue"});
    }

    const captaintoken = captain.generateAuthToken();
    const { accessToken, refreshToken } = captain.generateAuthTokens();

    res.status(200).json({
        captaintoken, // backward compatibility
        accessToken,
        refreshToken,
        captain
    });
};

module.exports.getCaptainProfile = async(req, res, next)=>{
    res.status(200).json({
        success: true,
        captain: req.captain
    });
};

module.exports.updateCaptainStatus = async(req, res, next)=>{
    try {
        const { active } = req.body;
        const captainId = req.captain._id;

        const captain = await captainModel.findByIdAndUpdate(
            captainId,
            { active: active },
            { new: true }
        );

        if (!captain) {
            return res.status(404).json({
                success: false,
                message: "Captain not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Status updated successfully",
            captain: captain
        });
    } catch (error) {
        console.error('❌ Error updating captain status:', error);
        res.status(500).json({
            success: false,
            message: "Error updating captain status",
            error: error.message
        });
    }
};

module.exports.logoutCaptain = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.decode(token);
            const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 86400;
            const ttl = expiresIn > 0 ? expiresIn : 3600;

            if (redisClient && redisClient.isOpen) {
                await redisClient.setEx(`blacklist:${token}`, ttl, 'revoked');
            }
            await BlacklistToken.create({ token }).catch(() => {});
        }

        res.clearCookie('token');
        return res.status(200).json({
            success: true,
            message: 'Captain logged out successfully, token blacklisted'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error during captain logout',
            error: error.message
        });
    }
};

module.exports.refreshCaptainToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        if (redisClient && redisClient.isOpen) {
            const isBlacklisted = await redisClient.get(`blacklist:${refreshToken}`);
            if (isBlacklisted) {
                return res.status(403).json({ message: 'Refresh token has been revoked' });
            }
        }

        const secret = process.env.JWT_REFRESH_SECRET || (config.JWT_SECRET + '_refresh');
        const decoded = jwt.verify(refreshToken, secret);

        const captain = await captainModel.findById(decoded._id);
        if (!captain) {
            return res.status(404).json({ message: 'Captain not found' });
        }

        const newTokens = captain.generateAuthTokens();
        return res.status(200).json({
            success: true,
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            captaintoken: newTokens.accessToken
        });
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};

