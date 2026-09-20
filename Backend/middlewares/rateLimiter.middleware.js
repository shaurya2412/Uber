let rateLimit;
try {
    rateLimit = require("express-rate-limit");
} catch (e) {
    // In-memory fallback if package is still installing
    rateLimit = (options) => {
        const hits = new Map();
        const windowMs = options.windowMs || 60000;
        const max = options.max || 100;
        return (req, res, next) => {
            const ip = req.ip || req.connection?.remoteAddress || 'unknown';
            const now = Date.now();
            const record = hits.get(ip) || { count: 0, resetTime: now + windowMs };
            if (now > record.resetTime) {
                record.count = 1;
                record.resetTime = now + windowMs;
            } else {
                record.count += 1;
            }
            hits.set(ip, record);
            if (record.count > max) {
                return res.status(429).json(options.message || { message: "Too many requests" });
            }
            next();
        };
    };
}

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests from this IP, please try again later." }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." }
});

const bookingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many ride requests. Please wait a moment." }
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 mins
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many OTP verification attempts. Please wait 5 minutes." }
});

module.exports = {
    apiLimiter,
    authLimiter,
    bookingLimiter,
    otpLimiter
};
