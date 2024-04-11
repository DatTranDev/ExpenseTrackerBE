const mongoose = require('mongoose');
const { CurrencyCodes } = require('validator/lib/isISO4217');
const Schema = mongoose.Schema;
const walletSchema = new Schema({
  name: { 
    type: String, 
    required: true 
    },
  amount: { 
    type: Number, 
    default: 0 
    },
  currency: { 
    type: String, 
    enum: ["VND", "USD"],
    default: "VND" 
    },
  isSharing: { 
    type: Boolean, 
    default: false 
    },
});

walletSchema.virtual("id").get(function(){
    return this._id.toHexString
})

walletSchema.set('toJSON',{
    "virtuals": true
})

const walletModel = mongoose.model("Wallet", walletSchema)
module.exports = walletModel;
