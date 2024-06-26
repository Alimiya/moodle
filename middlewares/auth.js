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
                    updatedAt: new Date()
                }
            })

            done(null, user)
        } catch (err) {
            done(err)
        }
    }
))

module.exports = passport