const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
},
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
},
  amount: { 
    type: Number, 
    required: true 
},
  period: { 
    type: String, 
    enum: ["Tuần", "Tháng", "Năm"] ,
    default: "Tháng"
}
});

budgetSchema.virtual("id").get(function(){
  return this._id.toHexString
})
budgetSchema.set('toJSON',{
  "virtuals": true
})

module.exports = mongoose.model('Budget', budgetSchema);
