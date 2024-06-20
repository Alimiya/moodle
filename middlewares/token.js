const jwt = require("jsonwebtoken")

const generateStudentToken = (user) => {
    return jwt.sign({_id: user._id, role: 'student'}, process.env.STUDENT_TOKEN_SECRET)
}
const generateTeacherToken = (user) => {
    return jwt.sign({_id: user._id, role: 'teacher'}, process.env.TEACHER_TOKEN_SECRET)
}
const generateManagerToken = (user) => {
    return jwt.sign({_id: user._id, role: 'manager'}, process.env.MANAGER_TOKEN_SECRET)
}
const generateAdminToken = (user) => {
    return jwt.sign({_id: user._id, role: 'admin'}, process.env.ADMIN_TOKEN_SECRET)
}


module.exports = {generateStudentToken, generateTeacherToken, generateManagerToken, generateAdminToken}
