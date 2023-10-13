const mongoose = require("mongoose")

const db = mongoose.connect(process.env.url).then(()=>{
    console.log("connected");
}).catch((error)=>{
 console.log("connerction fail",error);
})

module.exports = db