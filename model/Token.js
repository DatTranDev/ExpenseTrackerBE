const mongoose = require("mongoose")
const Schema = mongoose.Schema
const tokenSchema = new Schema({
    token: {
        type: String,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
}, {timestamps: true})

const tokenModel = mongoose.model("token", tokenSchema)

module.exports= tokenModel