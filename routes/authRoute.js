const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const {authLimiter} = require("../middlewares/limiter")
const passport = require('../middlewares/auth')

router.post('/login', authLimiter, authController.login)
router.post('/logout', authController.logout)

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/')
    })

module.exports = router