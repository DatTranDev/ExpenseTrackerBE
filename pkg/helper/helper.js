const validator = require('validator')
const mongoose = require("mongoose")

const isValidEmail =async  (email)=>{
    return await validator.isEmail(email)
}

const isValidPhoneNumber = async (phoneNumber) =>{
    return await validator.isMobilePhone(phoneNumber)
}

const isValidObjectID = async (id) =>{
    return await mongoose.isValidObjectId(id)
}

const randomCode =()=>{
    const codeInit = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890"
    let code = ""
    for(let i =0; i<6;i++){
        const index = Math.floor(Math.random()*codeInit.length)
        code += codeInit.charAt(index)
    }
    return code
}
module.exports = {isValidEmail, isValidPhoneNumber, isValidObjectID, randomCode}