const express = require("express")
const route = express.Router()
const user = require("../models/schema")
const islogedin = require("../middleware/auth")
const upload = require("../middleware/multer")
const cloudinary = require("cloudinary")

const cookieOption = {
    maxAge : 7*24*60*60*1000 , //7 days
    httpOnly:true,
    secure:true
}

route.post("/register",upload.single("avatar"),async(req,res)=>{
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
console.log("file" ,JSON.stringify(req.file));
if (req.file) {
    try {
       const result =await cloudinary.v2.uploader.upload(req.file.path,{
        folder:"learning",
        width:250,
        height:250,
        gravity:"faces",
        crop:"fill"
       })
       if (result) {
        user.avatar.public_id = result.public_id
        user.avatar.secure_url = result.secure_url

        fs.rm(`uploads/${req.files.filename}`)
       }
    } catch (error) {
        console.log(error,"error");
    }
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