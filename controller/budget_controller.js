const Budget = require('../model/Budget.js');
const Icon = require('../model/Icon.js');
const User = require('../model/User.js');
const Category = require('../model/Category.js');
const helper = require('../pkg/helper/helper.js');

const addNewBudget = async (req, res) => {
    //Check User exist
    const userId = req.body.userId;
    const isValidUserId = await helper.isValidObjectID(userId);
    if(!isValidUserId) return res.status(400).json({
        message: "Invalid user id"
    });
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })

    //Check Category exist
    const categoryId = req.body.categoryId;
    const isValidCategoryId = await helper.isValidObjectID(categoryId);
    if(!isValidCategoryId) return res.status(400).json({
        message: "Invalid category id"
    });
    const existCategory = await Category.findById(categoryId);
    if(!existCategory) return res.status(404).json({
        message: "Category is not found"
    })

    const budget = await Budget.findOne({userId: userId, categoryId: categoryId, period: req.body.period});
    if(budget) return res.status(400).json({
        message: "Ngân sách đã tồn tại"
    })
    const newBudget = new Budget(req.body);
    await newBudget.save().catch((err)=>{
        return res.status(500).json({
            message: err.message
        })
    })
    const category = await Category.findById(newBudget.categoryId).lean();
    const icon = await Icon.findById(category.iconId).lean();

    const budgetWithCategory = {
        ...newBudget._doc,
        category: {
            ...category,
            icon: icon
        }
    };

    return res.json({
        data: budgetWithCategory
    });
}
const updateBudget = async (req, res) => {
    const budgetId = req.params.id;
    const isValidBudgetId = await helper.isValidObjectID(budgetId);
    if(!isValidBudgetId) return res.status(400).json({
        message: "Invalid budget id"
    });
    const existBudget = await Budget.findById(budgetId);
    if(!existBudget) return res.status(404).json({
        message: "Budget is not found"
    })
    const categoryId = req.body.categoryId;
    if(categoryId != null){
        const isValidCategoryId = await helper.isValidObjectID(categoryId);
        if(!isValidCategoryId) return res.status(400).json({
            message: "Invalid category id"
        });
        const existCategory = await Category.findById(categoryId);
        if(!existCategory) return res.status(404).json({
            message: "Category is not found"
        })
    }
    const budget = await Budget.
    findOne({userId: existBudget.userId, 
            categoryId: categoryId != null ? categoryId : existBudget.categoryId, 
            period: req.body.period !=null ? req.body.period : existBudget.period});
    if(budget && budget._id != budgetId) return res.status(400).json({
        message: "Ngân sách đã tồn tại"
    })
    await Budget.findByIdAndUpdate(budgetId, req.body).catch((err)=>{
        return res.status(400).json({
            message: err.message
        })
    })
    return res.json({
        message: "Update budget successfully"
    })
}
const deleteBudget = async (req, res) => {
    const budgetId = req.params.id;
    const isValidBudgetId = await helper.isValidObjectID(budgetId);
    if(!isValidBudgetId) return res.status(400).json({
        message: "Invalid budget id"
    });
    const existBudget = await Budget.findById(budgetId);
    if(!existBudget) return res.status(404).json({
        message: "Budget is not found"
    })
    await Budget.findByIdAndDelete(budgetId).catch((err)=>{
        return res.status(500).json({
            message: err.message
        })
    })
    return res.json({
        message: "Delete budget successfully"
    })
}
module.exports = {addNewBudget, deleteBudget, updateBudget}