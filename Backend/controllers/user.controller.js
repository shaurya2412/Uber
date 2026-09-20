const userModel = require('../models/usermodel');
const userService = require("../services/user.service");
const BlacklistToken = require('../models/blacklistToken.model');
const redisClient = require('../db/redis');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { validationResult } = require('express-validator');

module.exports.registerUser = async(req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    const { fullname, email, password } = req.body;
    const { firstname, lastname } = fullname;

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: [{ msg: 'Email already registered' }] });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
      firstname,
      lastname,
      email,
      password: hashedPassword
    });

    const token = user.generateAuthToken();
    const { accessToken, refreshToken } = user.generateAuthTokens();
    
    res.status(201).json({
      token, // backward compatibility
      accessToken,
      refreshToken,
      user
    });  
  } catch (err) {
    return next(err);
  }
};

module.exports.loginUser = async(req, res, next)=> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if(!user){
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch){
      return res.status(401).json({ message: "Invalid password, or network issue" });
    }

    const token = user.generateAuthToken();
    const { accessToken, refreshToken } = user.generateAuthTokens();

    res.status(200).json({
      token, // backward compatibility
      accessToken,
      refreshToken,
      user
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.getUserprofile = async(req, res, next) => {
  res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.decode(token);
      const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 86400;
      const ttl = expiresIn > 0 ? expiresIn : 3600;

      // Redis blacklist with TTL
      if (redisClient && redisClient.isOpen) {
        await redisClient.setEx(`blacklist:${token}`, ttl, 'revoked');
      }
      // MongoDB fallback record
      await BlacklistToken.create({ token }).catch(() => {});
    }

    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully, token blacklisted'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

module.exports.refreshToken = async (req, res) => {
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

    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newTokens = user.generateAuthTokens();
    return res.status(200).json({
      success: true,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      token: newTokens.accessToken
    });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};