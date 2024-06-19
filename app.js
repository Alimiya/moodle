const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
require('dotenv').config()

const prisma = require('./middlewares/prisma')

const app = express()

app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true, httpOnly: true, sameSite: 'Strict', maxAge: 20 * 60 * 1000}
}))

app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`)
})

process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit()
})

module.exports = app