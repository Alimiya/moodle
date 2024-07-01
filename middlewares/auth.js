const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const {prisma, logger} = require('../middlewares/template')

passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async function(accessToken, refreshToken, profile, done) {
        try {
            const user = await prisma.user.update({
                where: { username: profile.username.toLowerCase() },
                data: {
                    githubId: profile.id,
                    githubConfirmed: true,
                    githubUrl: profile._json.html_url,
                    updatedAt: new Date()
                }
            })

            logger.info(`${user.id} added github ID`)
            done(null, user)
        } catch (err) {
            logger.error(err.message)
            done(err)
        }
    }
))

passport.serializeUser(function(user, done) {
    logger.info(`${user.id} serialized github ID`)
    done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
    try {
        const user = await prisma.user.findUnique({ where: { id } })
        logger.info(`${user.id} deserialized github ID`)
        done(null, user)
    } catch (err) {
        done(err)
    }
})

module.exports = passport