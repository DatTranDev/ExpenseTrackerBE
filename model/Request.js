const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const requestSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    walletId: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Request', requestSchema);
