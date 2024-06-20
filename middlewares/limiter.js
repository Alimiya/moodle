const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many requests from the IP address, please try later"
})

const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: "Too many requests from the IP address, please try later"
})

module.exports = {limiter, authLimiter}