const jwt = require('jsonwebtoken')
const prisma = require('./prisma')

const verifyToken = (secretKey, role) => async (req, res, next) => {
    const token = req.cookies[role]
    if (!token) return res.status(403).json({ message: 'Unauthorized' })

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' })

        const { id, role: userRole, sessionId } = decoded
        try {
            const user = await prisma.user.findUnique({
                where: {id:id}
            })

            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            if (user.currentSessionId !== sessionId) {
                return res.status(401).json({ message: 'Invalid session' })
            }

        req.user = { id, role: userRole }
        next()
        } catch (err) {
            res.status(500).json({ message: 'Internal server error' })
        }
    })
}

const verifyStudentToken = (secretKey) => verifyToken(secretKey, 'student')
const verifyTeacherToken = (secretKey) => verifyToken(secretKey, 'teacher')
const verifyManagerToken = (secretKey) => verifyToken(secretKey, 'manager')
const verifyAdminToken = (secretKey) => verifyToken(secretKey, 'admin')

module.exports = { verifyStudentToken, verifyTeacherToken, verifyManagerToken, verifyAdminToken }
