const {prisma, logger} = require('../middlewares/template')
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
    req.session.user = {
        id: user.id,
        role: user.role,
        token: token,
        sessionId: req.session.id
    }
    res.cookie(user.role, token, {
        maxAge: process.env.TOKEN_EXPIRE * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    })
    return res.status(200).json({message: "Login successful"})
}

exports.login = async (req, res) => {
    const {username, password} = req.body

    const {error} = loginSchema.validate({username, password})
    if (error) {
        return res.status(400).json({error: error.details[0].message})
    }

    try {
        const user = await prisma.user.findUnique({
            where: {username}
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
                    logger.error(err.message)
                    return res.status(500).json({message: 'Error regenerating session'})
                }
                const token = generateToken(user, user.role, req.session.id)

                try {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { currentSessionId: req.session.id }
                    })
                } catch (updateError) {
                    logger.error(updateError.message)
                    return res.status(500).json({ message: 'Error updating currentSessionId' })
                }
                logger.info(`${user.username} with role ${user.role} logged in`)
                return handleLoginSuccess(req, res, token, user)
            })
        } else {
            return res.status(401).json({message: "Incorrect username or password"})
        }
    } catch (err) {
        logger.error(err.message)
        res.status(500).json({message: 'Internal server error'})
    }
}

exports.logout = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(400).json({ message: 'No active session found' })
    }

    const { id, role, sessionId } = req.session.user

    try {
        await new Promise((resolve, reject) => {
            req.sessionStore.destroy(sessionId, err => {
                if (err) {
                    logger.error(`Error destroying session in Redis for user ${id}: ${err.message}`)
                    return reject(err)
                }
                resolve()
            })
        })

        await prisma.user.update({
            where: { id },
            data: { currentSessionId: null }
        })

        res.clearCookie(role, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        })

        res.clearCookie('connect.sid', {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        })

        req.session.destroy(err => {
            if (err) {
                logger.error(`Error destroying session for user ${id}: ${err.message}`)
                return res.status(500).json({ message: 'Error destroying session' })
            }
            logger.info(`User ${id} logged out`)
            return res.status(200).json({ message: 'Logout successful' })
        })

    } catch (err) {
        logger.error(`Error during logout for user ${id}: ${err.message}`)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

