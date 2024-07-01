const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const {logger} = require('./winston')
module.exports = {prisma, logger}