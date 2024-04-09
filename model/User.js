const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  userName: { 
    type: String, 
    required: true 
    },
  password: { 
    type: String, 
    required: true 
    }, 
  email: { 
    type: String, 
    required: true 
    },
  alertTime: { 
    type: String, 
    default: null 
    } 
});

userSchema.virtual("id").get(function(){
    return this._id.toHexString
})

userSchema.set('toJSON',{
    "virtuals": true
})

const userModel = mongoose.model("User", userSchema)
module.exports = userModel
