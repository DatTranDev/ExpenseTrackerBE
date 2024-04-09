const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  isPublic: { 
    type: Boolean, 
    default: false 
},
  iconId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Icon' 
},
  parentCategoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
},
  type: { 
    type: String, 
    enum: ['Khoản thu', 'Khoản chi', 'Cho vay', 'Đi vay', 'Thu nợ', 'Trả nợ'],
    required: true
}
});

categorySchema.virtual("id").get(function(){
    return this._id.toHexString
})
categorySchema.set('toJSON',{
    "virtuals": true
})

module.exports = mongoose.model('Category', categorySchema);
