const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
    razorpay_payment_id :{
        type:String,
        required:true
    },
    razorpay_subcription_id :{
        type:String,
        required:true
    },
    razorpay_signature_id :{
        type:String,
        required:true
    },
},{
    timestamps:true
})

const payment = model("payment",paymentSchema)

module.exports = payment