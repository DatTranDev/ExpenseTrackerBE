const User = require('../model/User.js');
const Category = require('../model/Category.js');
const UserCategory = require('../model/UserCategory.js');
const Wallet = require('../model/Wallet.js');
const UserWallet = require('../model/UserWallet.js');
const Transaction = require('../model/Transaction.js');
const Budget = require('../model/Budget.js');
const helper = require('../pkg/helper/helper.js');
const bcrypt = require("../pkg/auth/authorization.js");
const  register = async (req, res) => {
    console.log(req.body);
    const isValidEmail = await helper.isValidEmail(req.body.email);
    if(!isValidEmail) return res.status(400).json({
        message: "Invalid email"
    });
    const existUser = await User.findOne({
        email: req.body.email
    })
    if(existUser) return res.status(400).json({
        message: "Existed email"
    })
    const newUser = new User(req.body);
    newUser.password = await bcrypt.hashPassword(newUser.password);

    let userId = null;
    await newUser.save().then((data)=>{
        userId = data._id;
    })
    .catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })


    const categories = await Category.find({isPublic: true});
     // For each shared category, create a new UserCategory
     for (let category of categories) {
        const categoryId = category._id;
        const userCategory = new UserCategory(
            {userId: userId, categoryId: categoryId}
        );

        // Save the new UserCategory to the database
        await userCategory.save().catch((err)=>{
            return res.status(400).json({
                message: "Something went wrong when creating UserCategory: " + err.message
            })
        })
    }

    return res.json ({
        data: newUser
    })

}
const login = async (req, res) => {
    const existUser = await User.findOne({
        email: req.body.email
    })
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const isValidPassword = await bcrypt.comparePassword(req.body.password, existUser.password)
    if(!isValidPassword) return res.status(401).json({
        message: "Wrong password"
    })
    const user = await User.findOne({
        email: req.body.email
    }).select('-password')

    return res.json({
        data: user
    })
}
const changePassword = async (req, res) => {
    const isValidEmail = await helper.isValidEmail(req.body.email)
    if(!isValidEmail) return res.status(400).json({
        message: "Invalid email"
    })
    const existUser = await User.findOne({
        email: req.body.email
    })
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const password = req.body.password
    const hashPassword = await bcrypt.hashPassword(password)
    await User.findOneAndUpdate({
        email: req.body.email
    }, {password: hashPassword}).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Updated password successfully"
    })
}
const deleteUser = async (req, res) => {
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    await Transaction.deleteMany({
        userId: id
    }).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })

    await User.findByIdAndDelete(id).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Deleted successfully"
    })
}

//change Info not password
const updateUser = async (req, res) => {
    const id= req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    if(req.body.password != null) return res.status(400).json({
        message: "Use changePassword route to change password"
    })
    
    await User.findByIdAndUpdate(id,req.body).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong"
        })
    })
    return res.json({
        message: "Updated successfully"
    })
}
const getUserByEmail = async (req, res) => {
    const isValidEmail = await helper.isValidEmail(req.body.email)
    if(!isValidEmail) return res.status(400).json({
        message: "Invalid email"
    })
    const existUser = await User.findOne({
        email: req.body.email
    }).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    return res.json({
        data: existUser
    })
}
const getUserById = async (req, res) => {
    const id = req.params.id
    const isValidId = await helper.isValidObjectID(id)
    if(!isValidId) return res.status(400).json({
        message: "Invalid id"
    })
    const existUser = await User.findById(id).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    return res.json({
        data: existUser
    })
}
const logOut = async (req, res) => {
    return res.json({
        message: "Log out successfully"
    })
}
const getCategoryByUser = async (req, res) => {
    const userId = req.params.id;
    const isValidId = await helper.isValidObjectID(userId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const userCategory = await UserCategory.find({
        userId: userId
    }).populate({
        path: 'categoryId',
        populate: {
            path: 'iconId'
        }
    }).exec()

    // Map over the userCategory array and return only the categoryId field
    const categories = userCategory.map(doc => doc.categoryId);

    return res.json({
        data: categories
    })
}
const getWalletByUser = async (req, res) => {
    const userId = req.params.id;
    const isValidId = await helper.isValidObjectID(userId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const wallet = await UserWallet.find({
        userId: userId
    }).populate('walletId').exec()
    return res.json({
        data:  wallet.filter((item) => {
            return item.walletId.isSharing == false
        })
    })
}

const getSharingWalletByUser = async (req, res) => {
    const userId = req.params.id;
    const isValidId = await helper.isValidObjectID(userId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const wallet = await UserWallet.find({
        userId: userId
    }).populate("walletId").exec()
    return res.json({
        data:  wallet.filter((item) => {
            return item.walletId.isSharing == true
        })
    })
}

const getTransactionByUser = async (req, res) => {
    const userId = req.params.id;
    const isValidId = await helper.isValidObjectID(userId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const transaction = await Transaction.find({
        userId: userId
    }).exec()
    return res.json({
        data: transaction
    })
}
const getBudgetByUser = async (req, res) => {
    const userId = req.params.id;
    const isValidId = await helper.isValidObjectID(userId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const budget = await Budget.find({
        userId: userId
    }).exec()
    return res.json({
        data: budget
    })
}

module.exports = {register, login, changePassword, deleteUser, getTransactionByUser, getSharingWalletByUser,
    updateUser, getUserByEmail, getUserById, logOut, getCategoryByUser, getWalletByUser, getBudgetByUser}