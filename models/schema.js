const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")



const userSchema = mongoose.Schema({
name:{
    type:"String",
    required:true,
    minLength:[5,"Name must be at least of 5 charchter"],
    trim:true
},
email:{
    type:"String",
    required:true,
    unique:true,
    trim:true
},
password:{
    type:"String",
    required:true,
    trim:true,
    minLength:[5,"password must be at least of 8 charchter"],
},
avatar:{
    public_id:{
        type:"String",

    },
    secure_url:{
        type:"String"
    }
},
role:{
    type:"String",
    enum:["USER","ADMIN"],
    default:"USER",
},
forgetpasswordtoken:String,
forgetpasswordExpiry:Date,

},{
    timestamps:true
})
userSchema.pre("save",async function (next) {
    if (!this.isModified("password")) {
      return  next()
    }

    this.password = await bcrypt.hash(this.password,10)

})

userSchema.methods = {
    generateJWTToken: async function () {
        return await jwt.sign(
            {id:this._id,email:this.email,subcription:this.subcription,role:this.role},
            process.env.Secret,{
                expiresIn:process.env.expires
            }
        )
    },
    comparePassword: async function (plainTextPassword) {
        return await bcrypt.compare(plainTextPassword,this.password)
    },
    generatepasswordResetToken: async function () {
        const resetToken = await crypto.randomBytes(20).toString("hex")
 
        this.forgetpasswordtoken = crypto
             .createHash("sha256")
             .update(resetToken)
             .digest("hex")
             const currentTime = new Date();
              this.forgetpasswordExpiry = new Date(currentTime.getTime() + 15 * 60 * 1000)
        
             return resetToken
    }
}


const user = mongoose.model("user",userSchema)


module.exports = user

