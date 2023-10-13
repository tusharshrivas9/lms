const express = require("express")

const route = express.Router()
const user = require("../models/schema")
const islogedin = require("../middleware/auth")

const cookieOption = {
    maxAge : 7*24*60*60*1000 , //7 days
    httpOnly:true,
    secure:true
}

route.post("/register",async(req,res)=>{
const {name,email,password} = req.body
if (!name||!email||!password) {
    return res.status(400).json({msg:"please fill the form properly"})
}

const userExist = await user.findOne({email:email})

if (userExist) {
    return res.status(400).json({msg:"user already exist.."})
}
const newUser = await user.create({
    name,
    email,
    password,
    avatar:{
        public_id:email,
        secure_url:""
    }
})
if (!newUser) {
    return res.status(400).json({msg:"user registration fail"})
}
   await newUser.save();
   
   user.password = undefined

   const token = await newUser.generateJWTToken()
   res.cookie("token",token,cookieOption)

   res.status(201).json({
    msg:"sucess"
   })

})


// for login.....................................................


route.post("/login",async (req,res)=>{
    const {email,password} = req.body
  
    if (!email ,!password) {
        return res.status(400).json({
            msg:"please fill the details properly"
        })
    }
const user = await user.findOne({email:email}).select("+password") 
 
if (!user || !user.comparepassword(password)) {
    return  res.status(400).json({
        msg:"email or password does not match"
    })
}
 const token = await user.generateJWTToken()
 user.password = undefined
 res.cookie("token",token,cookieOption)

 res.status(200).json({msg:"sucessfully login"})
})


// logout...................................................................................

route.get("/logout",(req,res)=>{
res.cookie("token",null,{
    secure:true,
    maxAge:0,
    httpOnly:true
})
res.status(200).json({msg:"sucessfully logout"})
})

//user details................................................................................


route.get("/profile",islogedin,async (req,res)=>{

    try {
        const userId = req.user.id

        const User = await user.findOne(userId)   
      
        res.status(200).json({msg:"user detail",User})
    } catch (error) {
        console.log(error,"error");
    }
      
})




module.exports = route