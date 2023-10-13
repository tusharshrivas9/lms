const jwt = require("jsonwebtoken")




const islogedin = async(req,res,next)=>{
    const token = req.cookies

    if (!token) {
        return res.status(401).json("please login again")
    }

    const userDetail = await jwt.verify(token,process.env.Secret)

    req.user = userDetail

    next()
}

module.exports = islogedin