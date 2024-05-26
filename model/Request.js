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
    createAt: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    }
});
requestSchema.virtual("id").get(function(){
    return this._id.toHexString
    })
requestSchema.set('toJSON',{
    "virtuals": true
    })

module.exports = mongoose.model('Request', requestSchema);
