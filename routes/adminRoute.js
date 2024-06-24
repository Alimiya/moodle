const express = require('express')
const router = express.Router()
const Controller = require('../controllers/adminController')
const {verifyAdminToken} = require("../middlewares/verify")

router.get('/users', verifyAdminToken(process.env.ADMIN_TOKEN_SECRET), Controller.getUsers)

module.exports = router