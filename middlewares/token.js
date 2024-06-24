const jwt = require("jsonwebtoken")

const generateStudentToken = (user, session) => {
    return jwt.sign({id: user.id, role: 'student', sessionId: session}, process.env.STUDENT_TOKEN_SECRET)
}

const generateTeacherToken = (user, session) => {
    return jwt.sign({id: user.id, role: 'teacher', sessionId: session}, process.env.TEACHER_TOKEN_SECRET)
}

const generateManagerToken = (user, session) => {
    return jwt.sign({id: user.id, role: 'manager', sessionId: session}, process.env.MANAGER_TOKEN_SECRET)
}

const generateAdminToken = (user, session) => {
    return jwt.sign({id: user.id, role: 'admin', sessionId: session}, process.env.ADMIN_TOKEN_SECRET)
}

module.exports = {generateStudentToken, generateTeacherToken, generateManagerToken, generateAdminToken}
