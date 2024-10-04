const jwt = require("jsonwebtoken")
require("dotenv").config()
const secret = process.env.SECRET_KEY
const generateToken = async (payload, expired, type) =>{
    return await jwt.sign(
        {
            userId: payload._id,
            type: type
        },
        secret,
        {
            algorithm: "HS256",
            expiresIn: expired
        }
    )
}

const verifyToken = async (token) =>{
    return await jwt.verify(
        token,
        secret
    )   
}
module.exports={generateToken,verifyToken}