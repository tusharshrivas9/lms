const express = require("express")
const route = express.Router()
const user = require("../models/schema")
const islogedin = require("../middleware/auth")
const upload = require("../middleware/multer")
const cloudinary = require("cloudinary")
const fs = require("fs/promises")






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
//forgot password ................................................................................................
route.post("/forgot",async (req,res)=>{
 
    const {email} = req.body

    if (!email) {
        return  res.status(400).json({msg:"please give email"})
    }

    const User = await user.findOne({email})

    if (!User) {
      return  res.status(400).json({msg:"email is not registered"})  
    }

    const resetToken = await User.generatepasswordResetToken()

    await User.save()

    const resetPasswordurl = `${process.env.frontend}/reset-password/${resetToken}`

    const message = `${resetPasswordurl}`

    const subject = "reset password"
    try {
        await sendEmail (email,subject,message)

        res.status(200).json({
            msg:"token send to email sucessfully"
        })
    } catch (error) {
        user.forgetpasswordtoken
        user.forgetpasswordExpiry
      await User.save()

      return res.status(500).json({msg:"error"})  
    }

})

//reset password ...............................................................................................
route.post("/reset/:token",(req,res)=>{
    const {resetToken} = req.params

    const {password} = req.body

    const forgetpasswordtoken = crypto
      
         .createHash("sha256")
         .update(resetToken)
         .digest("hex")

         const User = await.user.findOne({
            forgetpasswordtoken,
            forgetpasswordExpiry:{$gt:Date.now()}
         })

         if (!User) {
            return res.status(500).json({msg:"error"})
         }

         User.password = password
         User.forgetpasswordtoken = undefined
         User.forgetpasswordExpiry = undefined

         User.save()


         res.status(200).json({msg:"sucess"})
})
route.post("/change_pass",islogedin,async(req,res)=>{

    const{oldpassword,newpassword} = req.body

    const {id} = req.user

    if (!oldpassword || !newpassword) {
       return res.status(400).json({msg:"please fill the details properly"})   
    }

    const User = user.findById(id).select("+password")

    if (!User) {
        return res.status(400).json({msg:"user not found"}) 
        
    }

    const isPasswardvalid = await User.comparePassword(oldpassword)

    if (isPasswardvalid) {
        return res.status(400).json({msg:"invalid old password"}) 
    }

    User.password = newpassword

    await User.save()

    User.password = undefined

    res.status(200).json({msg:"sucess"})

})

route.put("/update",islogedin,upload.single("avatar"),async(req,res)=>{

    const {name} = req.body

    const {id} = req.User.id

    const User = await user.findById(id) 

    if (!User) {
        return res.status(400).json({msg:"user not exist"})  
    }

    if (req.name) {
        User.name = name
    }

    if (req.file) {
        await cloudinary.v2.uploader.destroy(User.avatar.public_id)
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
   await user.save()

   res.status(200).json({msg:"sucess"})
    
})




module.exports = route