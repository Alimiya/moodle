const express = require('express')
require('dotenv').config()

const prisma = require('./middlewares/prisma')

const app = express()

app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())


app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`)
})

process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit()
})

module.exports = app