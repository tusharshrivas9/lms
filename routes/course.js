const express = require("express")
const islogedin = require("../middleware/auth")
const authourazation = require("../middleware/auth")
const routes = express.Router()
const fs = require("fs/promises")
const cloudinary = require("cloudinary")
const Course = require("../models/Course")
const upload = require("../middleware/multer")

routes.get("/",async(req,res)=>{

    try {
        const courses =await Course.find({}).select("-lecture")

        res.status(200).json({msg:"sucessfully login",courses})   
    } catch (error) {
        console.log(error,"error");
    }
   
})
routes.get("/:id",islogedin,async(req,res)=>{
    try {
        const {id} = req.params

        const course = await Course.findById(id)  

        res.status(200).json({msg:"sucessfully login",course})
    } catch (error) {
       console.log(error,"id error"); 
    }
})

.post(islogedin,async(req,res)=>{

    const {title,description,category,createdby} = req.body

    if  (!title ||!description ||!category ||!createdby) {
        return res.status(400).json({
            msg:"details does not match"
        })
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdby,
        thumbnail:{
            public_id:"dummy"
        },
        secure_url:"dummy"
    })

    if (!course) {
        return res.status(400).json({
            msg:"could not create course"
        })
    }

    if (req.file) {
         const result = await cloudinary.v2.uploader.upload(req.file.path,{
            folder:"lms"

         })

         if (result) {
            course.thumbnail.public_id = result.public_id
            course.thumbnail.secure_url = result.secure_url 
         }
         fs.rm(`uploads/${req.file.filename}`)
    }

    await course.save()

    res.status(200).json({
        msg:"sucess"
    })
})
routes.put("/:id",islogedin,authourazation("Admin"),async(req,res)=>{
try {
    const {id} = req.params

    const course = await Course.findByIdAndUpdate(
        id,
        {
            $set:req.body
        },
        {
            runValidators:true
        }
    ) 
    if (!course) {
        return res.status(500).json({
            msg:"details does not match"
        }) 
    }
} catch (error) {
   return res.status(500).json({
            msg:"details does not match",
            error
        }) 
}
res.status(200).json({
    msg:"course uploaded sucessfully"
})
})
routes.delete("/:id",islogedin,authourazation("Admin"),async(req,res,next)=>{
try {
    const {id} = req.params
    const course = await Course.findById(id)

    if (!course) {
         return res.status(500).json({
            msg:"details does not match",
            error
        })
    }

    await Course.findByIdAndDelete(id)

    return res.status(200).json({
            msg:"details does not match",
            error
        })
     
} catch (error) {
    return res.status(500).json({
            msg:"details does not match",
            error
        })
}
})
// add lecture to course
routes.post("/:id",islogedin,authourazation("Admin"),upload.single("lecture"),async(req,res)=>{
    const {title,description} = req.body

    const {id} = req.params

    if (!title || !description) {
      return res.status(500).json({
            msg:"please add tittle and description"
        }) 
    }

    const course = await Course.findById(id)

    if (!course) {
        return res.status(500).json({
           msg:"details does not match"
       })
   }
   const lectureData = {
     title,
     description,
     lecture:{}
   }

   try {
    if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path,{
           folder:"lms"
    
        })
    
        if (result) {
           course.lecture.public_id = result.public_id
           course.lecture.secure_url = result.secure_url 
        }
        fs.rm(`uploads/${req.file.filename}`)
    }
   } catch (error) {
    console.log(error,"error in lectureData");
   }
  

   course.lectureData.push(lectureData)

   course.numberOflecture = course.lecture.length

   await course.save()

   res.status(200).json({
    msg:"lecture added to the course"
   })
}
)


module.exports = routes