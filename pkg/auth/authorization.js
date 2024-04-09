const bcrypt = require("bcrypt")

const hashPassword = async (password) =>{
    return await bcrypt.hashSync(password,10)
}

const comparePassword = async (password, hashPassword)=>{
    return await bcrypt.compareSync(password,hashPassword)
}

module.exports={hashPassword,comparePassword}