const User = require('../model/User.js');
const Category = require('../model/Category.js');
const Transaction = require('../model/Transaction.js');
const Wallet = require('../model/Wallet.js');
const helper = require('../pkg/helper/helper.js');

const addTransaction = async (req, res) => {
    const userId = req.body.userId;
    const walletId = req.body.walletId;
    const categoryId = req.body.categoryId;


    //Format date
    const dateString = req.body.createdAt;
    const dateSplit = dateString.split("/")
    var day = parseInt(dateSplit[0], 10);
    var month = parseInt(dateSplit[1], 10) - 1; // Month is zero-based
    var year = parseInt(dateSplit[2], 10);
    const date = new Date(Date.UTC(year, month, day))

    const isValidId = await helper.isValidObjectID(userId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid user id"
    })
    const isValidWalletId = await helper.isValidObjectID(walletId);
    if(!isValidWalletId) return res.status(400).json({
        message: "Invalid wallet id"
    })
    const isValidCategoryId = await helper.isValidObjectID(categoryId);
    if(!isValidCategoryId) return res.status(400).json({
        message: "Invalid category id"
    })
    const existUser = await User.findById(userId);
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const existWallet = await Wallet.findById(walletId);
    if(!existWallet) return res.status(404).json({
        message: "Wallet is not found"
    })
    const existCategory = await Category.findById(categoryId);
    if(!existCategory) return res.status(404).json({
        message: "Category is not found"
    })
    const newTransaction = new Transaction({
        userId: userId,
        walletId: walletId,
        categoryId: categoryId,
        spend: req.body.spend,
        currency: req.body.currency,
        note: req.body.note,
        partner: req.body.partner,
        createdAt: date,
        image: req.body.image,
    })
    await newTransaction.save().then(async ()=>{
        if(['Khoản thu', 'Đi vay', 'Thu nợ'].includes(existCategory.type)){
            existWallet.amount += newTransaction.spend;
        }
        else{
            existWallet.amount -= newTransaction.spend;
        }
        await existWallet.save().catch(err => {
            return res.status(500).json({
                message: err.message
            })
        })
        return res.json({
            message: "Transaction added successfully",
            data: newTransaction
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: err.message
        })
    });
}
const deleteTransaction = async (req, res) => {
    const id = req.params.id;
    const isValidId = await helper.isValidObjectID(id);
    if(!isValidId) return res.status(400).json({
        message: "Invalid transaction id"
    })
    const existTransaction = await Transaction.findById(id);
    if(!existTransaction) return res.status(404).json({
        message: "Transaction is not found"
    })
    await Transaction.findByIdAndDelete(id).then(async ()=>{
        const existWallet = await Wallet.findById(existTransaction.walletId);
        if(['Khoản thu', 'Đi vay', 'Thu nợ'].includes(existTransaction.type)){
            existWallet.amount -= existTransaction.spend;
        }
        else{
            existWallet.amount += existTransaction.spend;
        }
        await existWallet.save().catch(err => {
            return res.status(500).json({
                message: err.message
            })
        })
        return res.json({
            message: "Transaction deleted successfully"
        })
    }).catch(err => {
        return res.status(500).json({
            message: err.message
        })
    })
}
const updateTransaction = async (req, res) => {
    const id = req.params.id;
    const isValidId = await helper.isValidObjectID(id);
    if(!isValidId) return res.status(400).json({
        message: "Invalid transaction id"
    })
    const existTransaction1 = await Transaction.findById(id);
    if(!existTransaction1) return res.status(404).json({
        message: "Transaction is not found"
    })
    const oldSpend = existTransaction1.spend;
    
    await Transaction.findByIdAndUpdate(id, {
        ...req.body,
        createdAt: new Date(req.body.createdAt)
    }).then(async ()=>{
        const existTransaction = await Transaction.findById(id);
        const existWallet = await Wallet.findById(existTransaction.walletId);
        if(['Khoản thu', 'Đi vay', 'Thu nợ'].includes(existTransaction.type)){
            existWallet.amount += existTransaction.spend;
            existWallet.amount -= oldSpend;
        }
        else{
            existWallet.amount -= existTransaction.spend;
            existWallet.amount += oldSpend;
        }
        await existWallet.save().catch(err => {
            return res.status(500).json({
                message: err.message
            })
        })
        Object.keys(req.body).forEach(key => {
            if (key === 'createdAt') {
                const [day, month, year] = req.body[key].split("/");
                existTransaction[key] = new Date(year, month - 1, day);
            } else {
                existTransaction[key] = req.body[key];
            }
        });
        existTransaction.markModified('createdAt');

        await existTransaction.save();
        return res.json({
            message: "Transaction updated successfully"
        })
    }).catch(err => {
        return res.status(500).json({
            message: err.message
        })
    })

}
const getNeedToPay = async (req, res) => {
    const userId = req.params.id;
    const isValidId = await helper.isValidObjectID(userId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId);
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const transactions = await Transaction.find({userId: userId}).exec();
    const transactionsWithCategory = await Promise.all(transactions.map(async (transaction) => {
        let transactionObj = transaction.toObject();
        transactionObj.category = await Category.findById(transaction.categoryId);
        return transactionObj;
    }));

    const filteredTransactions = transactionsWithCategory.filter(transaction => transaction.category.type === "Đi vay");

    return res.json({
        message: "Success",
        data: filteredTransactions
    })
}
const getNeedToReceive = async (req, res) => {
    const userId = req.params.id;
    const isValidId = await helper.isValidObjectID(userId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId);
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const transactions = await Transaction.find({userId: userId}).exec();
    const transactionsWithCategory = await Promise.all(transactions.map(async (transaction) => {
        let transactionObj = transaction.toObject();
        transactionObj.category = await Category.findById(transaction.categoryId);
        return transactionObj;
    }));

    const filteredTransactions = transactionsWithCategory.filter(transaction => transaction.category.type === "Cho vay");

    return res.json({
        message: "Success",
        data: filteredTransactions
    })
}
module.exports = {addTransaction, deleteTransaction, updateTransaction, getNeedToPay, getNeedToReceive}