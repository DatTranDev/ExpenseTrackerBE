const emailController = require("../controller/email_controller.js")
const express = require("express")
const route = express.Router()
route.post("/sendemail", emailController.sendEmail)
module.exports = route