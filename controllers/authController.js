const prisma = require('../middlewares/prisma')
const {
    generateStudentToken,
    generateTeacherToken,
    generateManagerToken,
    generateAdminToken
} = require('../middlewares/token')
const bcrypt = require('bcrypt')
const {loginSchema} = require("../validation/loginValidation")

function generateToken(user, role, session) {
    switch (role) {
        case 'student':
            return generateStudentToken(user, session)
        case 'teacher':
            return generateTeacherToken(user, session)
        case 'manager':
            return generateManagerToken(user, session)
        case 'admin':
            return generateAdminToken(user, session)
        default:
            throw new Error('Invalid role')
    }
}

function handleLoginSuccess(req, res, token, user) {
    res.cookie(user.role, token, {
        maxAge: process.env.TOKEN_EXPIRE * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    })

    req.session.user = {
        id: user.id,
        role: user.role,
        token: token,
        sessionId: user.currentSessionId
    }

    return res.status(200).json({message: "Login successful"})
}

exports.login = async (req, res) => {
    const {email, password} = req.body

    const {error} = loginSchema.validate({email, password})
    if (error) {
        return res.status(400).json({error: error.details[0].message})
    }

    try {
        const user = await prisma.user.findUnique({
            where: {email}
        })

        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }

        const validPassword = await bcrypt.compare(password, user.password)

        if (validPassword) {
            if (user.currentSessionId) {
                await new Promise((resolve, reject) => {
                    req.sessionStore.destroy(user.currentSessionId, err => {
                        if (err) {
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
                const token = generateToken(user, user.role, req.session.id)

                try {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { currentSessionId: req.session.id }
                    })
                } catch (updateError) {
                    return res.status(500).json({ message: 'Error updating currentSessionId' })
                }

                return handleLoginSuccess(req, res, token, user)
            })
        } else {
            return res.status(401).json({message: "Incorrect email or password"})
        }
    } catch (err) {
        res.status(500).json({message: 'Internal server error'})
    }
}