const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const transactionExpSchema = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
    },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
    },
  image:{
      type: String
    },
  note: { 
    type: String 
    },
  spend: { 
    type: Number, 
    required: true 
    },
  currency: { 
    type: String,
    enum: ['VND', 'USD'],
    default: 'VND'
    },
  partner: { 
    type: String 
    },
  walletId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Wallet' 
    },
  createdAt: { 
    type: Date, 
    default: Date.now 
    },
});

transactionExpSchema.virtual("id").get(function(){
  return this._id.toHexString
})

transactionExpSchema.set('toJSON',{
  "virtuals": true
})  


const transactionExpModel = mongoose.model('Transaction', transactionExpSchema);
module.exports = transactionExpModel
