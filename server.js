const express = require("express")
const morgan = require("morgan")
 const cookieParser = require("cookies-parser")
const dotenv = require("dotenv")
dotenv.config()
const db = require("./config/db")
const routes = require("./routes/route")
const { v2 } = require("cloudinary")
const route = require("./routes/course")
const router = require("./routes/payment")
const Razorpay = require('razorpay');
const port = process.env.port || 2000
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api",route)
app.use("/api/course",routes)
app.use("/api/v1/payment",router)
// app.use(cookieParser())
app.use(morgan("dev"))

v2.config({
 cloud_name: process.env.cloud_name, 
  api_key: process.env.api_key, 
  api_secret: process.env.api_secret 
});

 const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY ,
});

app.listen(port,()=>{
    console.log(`listening to server ${port}`);
})

module.exports = instance
