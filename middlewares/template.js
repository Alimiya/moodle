const { PrismaClient } = require('@prisma/client')
const template = new PrismaClient()
const {logger} = require('./winston')
module.exports = {prisma: template, logger}