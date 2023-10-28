const express = require("express")
const { razorpayapikey, buysubcription, verifysubcription, cancelsubcription } = require("../controller/payment")
const { islogedin, authourazation } = require("../middleware/auth")

const router = express.Router()

router
      .route("/razorpay-key")
      .get(razorpayapikey,islogedin)

router
      .route("/subcribe")
      .get(buysubcription,islogedin)

router
      .route("/verify")
      .get(verifysubcription,islogedin)

router
      .route("/unsubcription")
      .get(cancelsubcription,islogedin,authourazation("Admin"))

module.exports = router
