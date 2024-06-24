const prisma = require('../middlewares/prisma')

exports.getUsers = async (req, res) => {
    try {
        const user = await prisma.user.findMany({})
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json({message:'Internal server error'})
    }
}