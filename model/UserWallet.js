const mongoose = require('mongoose');

const userWalletSchema = new mongoose.Schema({
  walletId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Wallet' 
},
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
}
});

module.exports = mongoose.model('UserWallet', userWalletSchema);
