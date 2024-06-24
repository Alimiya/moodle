const winston = require('winston')
const {createLogger, format, transports} = winston
const DailyRotateFile = require('winston-daily-rotate-file')
// const {ElasticsearchTransport} = require('winston-elasticsearch')

const rotateTransport = new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d'
})

// const logstashTransport = new ElasticsearchTransport({
//     level: 'info',
//     format: format.combine(
//         format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//         format.json()
//     ),
//     index: 'logs',
//     transformer: (logData) => ({ '@timestamp': logData.timestamp, message: logData.message }),
//     ensureMappingTemplate: true,
//     clientOpts: { node: 'http://localhost:9200' }
// })

const consoleTransport = new transports.Console()

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.json()
    ),
    transports: [
        rotateTransport,
        consoleTransport
    ]
})

const requestLogger = (req, res, next) => {
    logger.info(`[${new Date().toISOString()}] Received ${req.method} request for ${req.url}`)
    next()
}

module.exports = { logger, requestLogger }
