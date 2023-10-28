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

const authourazation = (...role)=> async(req,res)=>{
    const currentUserRole = req.user.role
    if (!role.includes(currentUserRole)) {
        return res.status(400).json("you dont have permission")
    }
}

module.exports = {islogedin,authourazation}