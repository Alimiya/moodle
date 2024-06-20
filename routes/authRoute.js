const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const {authLimiter} = require("../middlewares/limiter")

router.post('/login', authLimiter, authController.login)

module.exports = router