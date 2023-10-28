import user from "../models/schema"
import { instance } from "../server"



export const razorpayapikey = async (req,res)=>{
   res.status(200).json({
    msg:"Razorpay api key",
    key:process.env.RAZORPAY_KEY 
   }) 
}


export const buysubcription = async (req,res,)=>{

    const {id} = req.user

    const User = await user.findById(id)

    if (!User) {
        return res.status(400).json({msg:"unauthorize please login"})
    }

    if (User.role ==="Admin") {
        return res.status(400).json({msg:"admin can't login"})
    }

    const subcription = await instance.subscriptions.create({
        plan_id:process.env.RAZORPAY_PLAN_ID,
        customer_notify:1
    })

    User.subcription.id = subcription.id
    User.subcription.status = subcription.status

    await User.save()

    res.status(200).json({
        msg:"subcribed sucessfully"
    })
}





export const verifysubcription = async (req,res,next)=>{

    const {id} = req.user

    const {razorpay_payment_id,razorpay_signature,razorpay_subcription_id} = req.body

    const User = await user.findById(id)

    if (!User) {
        return res.status(200).json({
            msg:"unauthorize please login"
        })
    }

    const subcriptionId = User.subscriptions.id

    const generatedSignatue = crypto

    .createHmac("sha256",process.env.RAZORPAY_SECRET_KEY)
    .update(`${razorpay_Payment_id}|${subcriptionId}`)
    .digest("hex")

    if (generatedSignatue !== razorpay_signature) {
        return res.status(500).json({msg:"payment not verify please try again"})
    }
}


  await Payment.create({
    razorpay_Payment_id,
    razorpay_signature,
    razorpay_subcription_id
  })

  User.subcription.status = "active"
  await User.save()

  res.status(200).json({
    msg:"payment verify suscessful"
  })
  

export const cancelsubcription = async (req,res,next)=>{

}


