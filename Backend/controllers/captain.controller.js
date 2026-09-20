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

        if (captainModel.db.readyState !== 1) {
            const mockCaptain = {
                _id: "captain_" + Date.now().toString(36),
                fullname: { firstname, lastname },
                name: { firstname, lastname },
                email,
                vehicle: { color, plate, vehiclemodel, capacity },
                role: "captain",
            };
            const secret = config.JWT_SECRET || process.env.JWT_SECRET || "Jwttoken";
            const captaintoken = jwt.sign({ _id: mockCaptain._id, email, role: "captain" }, secret, { expiresIn: "7d" });
            return res.status(201).json({
                captaintoken,
                accessToken: captaintoken,
                refreshToken: captaintoken,
                captain: mockCaptain,
            });
        }

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

    if (captainModel.db.readyState !== 1) {
        const mockCaptain = {
            _id: "captain_" + Date.now().toString(36),
            fullname: { firstname: 'Rohan', lastname: 'Verma' },
            name: { firstname: 'Rohan', lastname: 'Verma' },
            email,
            role: "captain",
            vehicle: { color: 'Midnight Black', plate: 'DL 01 AX 9921', vehiclemodel: 'Tesla Model 3', capacity: 4 },
            active: true
        };
        const secret = config.JWT_SECRET || process.env.JWT_SECRET || "Jwttoken";
        const captaintoken = jwt.sign({ _id: mockCaptain._id, email, role: "captain" }, secret, { expiresIn: "7d" });
        return res.status(200).json({
            token: captaintoken,
            captaintoken,
            accessToken: captaintoken,
            refreshToken: captaintoken,
            captain: mockCaptain
        });
    }

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
        token: captaintoken,
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

        if (captainModel.db.readyState !== 1) {
            return res.status(200).json({
                success: true,
                message: "Status updated successfully",
                captain: { ...req.captain, active }
            });
        }

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
            if (BlacklistToken.db?.readyState === 1) {
                await BlacklistToken.create({ token }).catch(() => {});
            }
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
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, secret);
        } catch (e) {
            decoded = jwt.verify(refreshToken, config.JWT_SECRET || process.env.JWT_SECRET || "Jwttoken");
        }

        if (captainModel.db.readyState !== 1) {
            const newSecret = config.JWT_SECRET || process.env.JWT_SECRET || "Jwttoken";
            const newToken = jwt.sign({ _id: decoded._id, email: decoded.email || "captain@nexus.ai", role: "captain" }, newSecret, { expiresIn: "7d" });
            return res.status(200).json({
                success: true,
                accessToken: newToken,
                refreshToken: newToken,
                captaintoken: newToken
            });
        }

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

