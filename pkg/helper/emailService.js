const nodemailer = require("nodemailer")
require("dotenv").config()


const sendEmailService =async (email, code) =>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const info = await transporter.sendMail({
        from: '"App Service" <appservice.uit.se@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Your verified code", // Subject line
        text: `Verified code: ${code}`, // plain text body
      });
}

module.exports = {sendEmailService}