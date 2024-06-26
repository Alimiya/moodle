const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const RedisStore = require('connect-redis').default
const redis = require('redis')
const passport = require('./middlewares/auth')
require('dotenv').config()

const prisma = require('./middlewares/template')

const app = express()

const redisClient = redis.createClient({
    url: process.env.REDIS_URL
})

redisClient.on('error', (err) => {
    console.error('Redis client error:', err)
})

redisClient.connect().catch(err => {
    console.error('Redis connection error:', err)
})

app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false, httpOnly: true, sameSite: 'Strict', maxAge: parseInt(process.env.TOKEN_EXPIRE, 10) * 1000}
}))
app.use(passport.initialize())
app.use(passport.session())

const adminRoute = require('./routes/adminRoute')
const authRoute = require('./routes/authRoute')
const renderRoute = require('./routes/renderRoute')

app.use('/api/admin', adminRoute)
app.use('/api/auth', authRoute)
app.use(renderRoute)

app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`)
})

process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit()
})

module.exports = app