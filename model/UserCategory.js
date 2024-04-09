const mongoose = require('mongoose');

const userCategorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
},
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category'
}
});

module.exports = mongoose.model('UserCategory', userCategorySchema);
