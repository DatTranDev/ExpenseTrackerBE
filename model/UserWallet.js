const mongoose = require('mongoose');

const userWalletSchema = new mongoose.Schema({
  walletId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Wallet' 
},
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
},
  isCreator: { 
    type: Boolean, 
    default: false
  }
});

module.exports = mongoose.model('UserWallet', userWalletSchema);
