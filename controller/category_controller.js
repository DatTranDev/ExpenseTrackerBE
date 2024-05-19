const Category = require('../model/Category.js');
const UserCategory = require('../model/UserCategory.js');
const Icon = require('../model/Icon.js');
const Wallet = require('../model/Wallet.js');
const Transaction = require('../model/Transaction.js');

const User = require('../model/User.js');
const helper = require('../pkg/helper/helper.js');

const addNewCategory = async (req, res) => {
    //Check Use exist
    const userId = req.body.userId;
    const isValidUserId = await helper.isValidObjectID(userId);
    if(!isValidUserId) return res.status(400).json({
        message: "Invalid user id"
    });
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })

    //Check Icon exist
    const iconId = req.body.iconId;
    const isValidIconId = await helper.isValidObjectID(iconId);
    if(!isValidIconId) return res.status(400).json({
        message: "Invalid icon id"
    });
    const existIcon = await Icon.findById(iconId);
    if(!existIcon) return res.status(404).json({
        message: "Icon is not found"
    })

    //Check Parent Category exist
    const parentCategoryId = req.body.parentCategoryId;
    if(parentCategoryId){
        const isValidParentCategoryId = await helper.isValidObjectID(parentCategoryId);
        if(!isValidParentCategoryId) return res.status(400).json({
            message: "Invalid parent category id"
        });
        const existParentCategory = await Category.findById(parentCategoryId);
        if(!existParentCategory) return res.status(404).json({
            message: "Parent category is not found"
        })
    }

    const category = new Category({
        name: req.body.name,
        type: req.body.type,
        iconId: iconId,
        parentCategoryId: parentCategoryId,
        isPublic: req.body.isPublic
    });
    const newCategory = new Category(category);
    await newCategory.save().then((data)=>{
        const cateData = data;
        const userCategory = new UserCategory({
            userId: userId,
            categoryId: data._id
        });
        const newUserCategory = new UserCategory(userCategory);
        newUserCategory.save().then(()=>{
            return res.json({
                message: "Created successfully",
                data: cateData
            })
        }).catch((err)=>{
            return res.status(400).json({
                message: "Something went wrong"
            })
        })
    }).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
};

const deleteCategory = async (req, res) => {
    const categoryId = req.body.categoryId;
    const userId = req.body.userId;
    const isValidId = await helper.isValidObjectID(categoryId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid category id"
    })
    const existCategory = await Category.findById(categoryId);
    if(!existCategory) return res.status(404).json({
        message: "Category is not found"
    })

    const isValidUserId = await helper.isValidObjectID(userId);
    if(!isValidUserId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    // Delete all UserCategory and Transaction documents that have the categoryId
    await UserCategory.deleteMany({ categoryid: categoryId, userId: userId }).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong when deleting UserCategory: " + err.message
        })
    });
    const transactions = await Transaction.find({ categoryid: categoryId, userId: userId });
    
    for(let transaction of transactions){
        await Transaction.findByIdAndDelete(transaction._id).then(async ()=>{
            const existWallet = await Wallet.findById(transaction.walletId);
            if(['Khoản thu', 'Đi vay', 'Thu nợ'].includes(transaction.type))
                existWallet.amount -= transaction.amount;
            else
                existWallet.amount += transaction.amount;
            await existWallet.save().catch((err)=>{
                return res.status(400).json({
                    message: "Something went wrong when updating Wallet: " + err.message
                })
            });
        }).catch((err)=>{
            return res.status(400).json({
                message: "Something went wrong when deleting Transaction: " + err.message
            })
        });
    }
    // Delete the category if it is not public
    if (!existCategory.isPublic) {
        await Category.findByIdAndDelete(categoryId).catch((err)=>{
            return res.status(400).json({
                message: "Something went wrong when deleting Category: " + err.message
            })
        });
    }

    //Delete Budgets 
    await Budget.deleteMany({ categoryId: categoryId, userId: userId }).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong when deleting Budget: " + err.message
        })
    });
    return res.json({
        message: "Deleted successfully"
    });
}

module.exports = { addNewCategory, deleteCategory };