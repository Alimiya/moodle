const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
require('dotenv').config()

const prisma = require('./middlewares/prisma')

const app = express()

app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
        ttl: parseInt(process.env.TOKEN_EXPIRE, 10)
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: true, httpOnly: true, sameSite: 'Strict', maxAge: process.env.TOKEN_EXPIRE * 1000}
}))

const authRoute = require('./routes/authRoute')
const renderRoute = require('./routes/renderRoute')

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