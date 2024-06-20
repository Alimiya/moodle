const prisma = require('../middlewares/prisma')
const {
    generateStudentToken,
    generateTeacherToken,
    generateManagerToken,
    generateAdminToken
} = require('../middlewares/token')
const bcrypt = require('bcrypt')

function generateToken(user, role) {
    switch (role) {
        case 'student':
            return generateStudentToken(user)
        case 'teacher':
            return generateTeacherToken(user)
        case 'manager':
            return generateManagerToken(user)
        case 'admin':
            return generateAdminToken(user)
        default:
            throw new Error('Invalid role')
    }
}

function handleLoginSuccess(res, token, role, userId) {
    res.cookie(role, token, {
        maxAge: process.env.TOKEN_EXPIRE * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    })
    res.status(200).json({message: "Login successful"})
}

exports.login = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await prisma.user.findUnique({
            where: {email}
        })

        if (!user) return res.status(404).json({error: 'User not found'})

        const validPassword = await bcrypt.compare(password, user.password)

        if (validPassword) {

            if (user.currentSessionId) {
                await new Promise((resolve, reject) => {
                    req.sessionStore.destroy(user.currentSessionId, err => {
                        if (err) {
                            console.error('Error destroying previous session')
                            return reject(err)
                        }
                        resolve()
                    })
                })
            }

            req.session.regenerate(async err => {
                if (err) {
                    return res.status(500).json({message: 'Error regenerating session'})
                }

                const token = generateToken(user, user.role)

                req.session.user = {
                    id: user.id,
                    role: user.role,
                    token: token,
                    sessionId: user.currentSessionId
                }

                await prisma.user.update({
                    where: {id: user.id},
                    data: {currentSessionId: req.session.id}
                })

                handleLoginSuccess(res, token, user.role, user.id)
            })
        }
        return res.status(401).json({message: "Incorrect email or password"})
    } catch (err) {
        res.status(500).json({message: 'Internal server error'})
    }
}