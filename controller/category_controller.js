const Category = require('../model/Category.js');
const UserCategory = require('../model/UserCategory.js');
const Icon = require('../model/Icon.js');
const Budget = require('../model/Budget.js');
const Wallet = require('../model/Wallet.js');
const Transaction = require('../model/Transaction.js');
const mongoose = require('mongoose');

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
    const name = req.body.name.trim();
    const existingCategory = await Category.findOne({name: new RegExp(`^${name}$`, 'i')});

    if (existingCategory) {
        const existingUserCategory = await UserCategory.findOne({ userId: userId, categoryId: existingCategory._id });
        console.log(existingUserCategory);
        if (existingUserCategory) 
            return res.status(400).json({
                message: "Danh mục đã tồn tại"
            });
    }
    const category = new Category({
        name: req.body.name,
        type: req.body.type,
        iconId: iconId,
        parentCategoryId: parentCategoryId,
        isPublic: req.body.isPublic
    });
    const newCategory = new Category(category);
    await newCategory.save().then(async (data)=>{
        const parentCategory = await Category.findById(data.parentCategoryId).lean();
        const icon = await Icon.findById(data.iconId).lean();
        const cateData = {
            ...data._doc,
            id: data._id,
            parentCategory: {
                ...parentCategory,
                id: parentCategory != null ? parentCategory._id : null
            },
            icon: {
                ...icon
            }
        };
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
            message: "Something went wrong " + err.message
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
    console.log(existCategory);

    if(existCategory.parentCategoryId==null){
        const childCategories = await Category.find({parentCategoryId: categoryId});
        if(childCategories.length>0){
            return res.status(400).json({
                message: "Hãy xóa tất cả danh mục con trước khi xóa danh mục cha"
            })
        }
    } 

    const userCategory = await UserCategory.findOne({ categoryId: categoryId, userId: userId });

    if (!userCategory) {
        return res.status(404).json({
            message: "UserCategory not found"
        });
    }

    try {
        const result = await UserCategory.findByIdAndDelete(userCategory._id);
        console.log(result);
    } catch (err) {
        return res.status(400).json({
            message: "Something went wrong when deleting UserCategory: " + err.message
        });
    }
    const transactions = await Transaction.find({ categoryId: categoryId, userId: userId });
    
    for(let transaction of transactions){
        await Transaction.findByIdAndDelete(transaction._id).then(async ()=>{
            const existWallet = await Wallet.findById(transaction.walletId);
            if(['Khoản thu', 'Đi vay', 'Thu nợ'].includes(transaction.type))
                existWallet.amount -= transaction.spend;
            else
                existWallet.amount += transaction.spend;
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

const updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    const userId = req.body.userId;
    const isValidId = await helper.isValidObjectID(categoryId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid category id"
    })
    const existCategory = await Category.findById(categoryId);
    if(!existCategory) return res.status(404).json({
        message: "Category is not found"
    })
    if(existCategory.isPublic) return res.status(400).json({
        message: "Không thể sửa danh mục công khai"
    })

    const type = req.body.type;
    if(type != null && type != existCategory.type) return res.status(400).json({
        message: "Không thể sửa loại danh mục"
    })

    const isValidUserId = await helper.isValidObjectID(userId);
    if(!isValidUserId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })   

    //Check Icon exist
    const iconId = req.body.iconId;
    if(iconId){
        const isValidIconId = await helper.isValidObjectID(iconId);
        if(!isValidIconId) return res.status(400).json({
            message: "Invalid icon id"
        });
        const existIcon = await Icon.findById(iconId);
        if(!existIcon) return res.status(404).json({
            message: "Icon is not found"
        })
    }

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

    const name = req.body.name.trim();
    const existingCategory = await Category.findOne({name: new RegExp(`^${name}$`, 'i')});

    if (existingCategory && existingCategory._id.toString() !== categoryId) {
        const existingUserCategory = await UserCategory.findOne({ userId: userId, categoryId: existingCategory._id });
        if (existingUserCategory) 
            return res.status(400).json({
                message: "Danh mục đã tồn tại"
            });
    }
    await Category.findOneAndUpdate({ _id: categoryId }, req.body).then(async (data)=>{
        return res.json({
            message: "Cập nhật thành công",
            data: data
        })
    }).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong",
        })
    })
}

module.exports = { addNewCategory, deleteCategory, updateCategory };