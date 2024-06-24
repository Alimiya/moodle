const {prisma, logger} = require('../middlewares/template')

exports.getUsers = async (req, res) => {
    console.log(req.session, req.session.user)
    try {
        const user = await prisma.user.findMany({})
        res.status(200).json(user)
    } catch (err) {
        logger.error(err.message)
        res.status(500).json({message:'Internal server error'})
    }
}