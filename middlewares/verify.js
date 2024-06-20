const jwt = require('jsonwebtoken')

const verifyToken = (secretKey, role) => (req, res, next) => {
    const token = req.cookies[role]
    if (!token) return res.status(403).json({ message: 'Unauthorized' })

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' })

        const { _id, role: userRole } = decoded
        req.user = { _id, role: userRole }
        next()
    })
}

const verifyStudentToken = (secretKey) => verifyToken(secretKey, 'student')
const verifyTeacherToken = (secretKey) => verifyToken(secretKey, 'teacher')
const verifyManagerToken = (secretKey) => verifyToken(secretKey, 'manager')
const verifyAdminToken = (secretKey) => verifyToken(secretKey, 'admin')

module.exports = { verifyStudentToken, verifyTeacherToken, verifyManagerToken, verifyAdminToken }
