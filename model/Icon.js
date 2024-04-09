const mongoose = require('mongoose');

const iconSchema = new mongoose.Schema({
  linking: { type: String, required: true }
});

iconSchema.virtual("id").get(function(){
    return this._id.toHexString
    })
iconSchema.set('toJSON',{
    "virtuals": true
    })
    
module.exports = mongoose.model('Icon', iconSchema);
