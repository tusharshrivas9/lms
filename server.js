const express = require("express")
const morgan = require("morgan")
 const cookieParser = require("cookies-parser")
const dotenv = require("dotenv")
dotenv.config()
const db = require("./config/db")
const route = require("./routes/route")
const port = process.env.port || 2000
const app = express()

app.use(express.json())
app.use("/api",route)
// app.use(cookieParser())
app.use(morgan("dev"))

app.listen(port,()=>{
    console.log(`listening to server ${port}`);
})


