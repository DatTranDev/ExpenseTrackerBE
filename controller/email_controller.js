const Service = require("../pkg/helper/emailService.js")
const Helper = require("../pkg/helper/helper.js")
const User = require("../model/User.js")
const sendEmail = async (req,res)=>{
    try{     
        const email =req.body.email
        const isValidEmail = await Helper.isValidEmail(email)
        if(!isValidEmail) return res.status(400).json({
            message: "Invalid email"
        })
        const existUser = await User.findOne({
            email: email
        })
        if(!existUser) return res.status(404).json({
            message: "User is not found"
        })
        const code = Helper.randomCode()
        await Service.sendEmailService(email,code)
        res.json({
            message: "Send email successfull",
            userCode: code
        })
    }catch(e){
        res.status(400).json({
            message: "Something went wrong"
        })
    }
    
}

module.exports= {sendEmail}