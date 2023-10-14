const multer = require("multer")
const path = require("path")

const upload =multer({
    dest:"uploads/",
    limits:{fileSize:50*1024*1024}, //50 mb
    storage:multer.diskStorage({
        destination:"uploads/",
        filename:(_req,file,cb)=>{
        cb(null,file.originalname)
        },
    }),
    fileFilter:(_req,file,cb)=>{
        let ext = path.extname(file.originalname)
        if (
            ext !== ".jpg" &&
            ext !== ".jpeg" &&
            ext !== ".webp" &&
            ext !== ".png" &&
            ext !== ".mp4" 
        ) {
           return alert("not in valid format"); 
        }
        cb(null,true)
    }

})

module.exports = upload