const express = require('express')
const router = express.Router()
const Controller = require('../controllers/renderController')

router.get('/login', Controller.getLogin)

module.exports = router