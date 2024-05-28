const Wallet = require('../model/Wallet.js');
const User = require('../model/User.js');
const UserWallet = require('../model/UserWallet.js');
const Category = require('../model/Category.js');
const Transaction = require('../model/Transaction.js');
const Request = require('../model/Request.js');
const helper = require('../pkg/helper/helper.js');

const addNewWallet = async (req, res) => {
    let listUserId = [];
    if (req.body.isSharing==true){
        //Find and get user id from email
        const listUserEmail = req.body.inviteUserMail;
        for (let i = 0; i < listUserEmail.length; i++) {
            const email = listUserEmail[i];
            const isValidEmail = await helper.isValidEmail(email);
            if(!isValidEmail) return res.status(400).json({
                message: "Invalid email"
            });
            const exist = await User.findOne({email: email});
            if(!exist) return res.status(404).json({
                message: "Email is not found as a user"
            });
            listUserId.push(exist._id);
        }
       
    }
    const userId = req.body.userId;
    const isValidUserId = await helper.isValidObjectID(userId);
    if(!isValidUserId) return res.status(400).json({
        message: "Invalid user id"
    });
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const name = req.body.name.trim();
    const existingWallet = await Wallet.findOne({name: new RegExp(`^${name}$`, 'i')});
    if(existingWallet){
        const existingUserWallet = await UserWallet.findOne({userId: userId, walletId: existingWallet._id});
        if(existingUserWallet) return res.status(400).json({
            message: "Ví đã tồn tại"
        });
    }


    const wallet = new Wallet({
        name: req.body.name,
        amount: req.body.amount,
        currency: req.body.currency,
        isSharing: req.body.isSharing
    });
    const newWallet = new Wallet(wallet);
    await newWallet.save().then((data)=>{
        const walletData = data;
        const userWallet = new UserWallet({
            userId: userId,
            walletId: data._id,
            isCreator: true
        });
        const newUserWallet = new UserWallet(userWallet);
        newUserWallet.save().then(()=>{
            if(req.body.isSharing==true){
                //Send request to other users
                listUserId.forEach( async (receiverId) => {
                    const request = new Request({
                        senderId: userId,
                        receiverId: receiverId,
                        walletId: data._id,
                        createAt: Date.now(),
                        name: `${existUser.userName} mời bạn vào quỹ ${data.name}`
                    });
                    const newRequest = new Request(request);
                    await newRequest.save().catch(err=>{
                        return res.status(500).json({
                            message: err.message
                        })
                    });
                });
            }
            return res.status(200).json({
                message: req.body.isSharing ? "Wallet is created successfully and send request successfully": "Wallet is created successfully" ,
                data: walletData
            })
        }).catch(err=>{
            return res.status(500).json({
                message: err.message
            })
        })
    }).catch(err=>{
        return res.status(500).json({
            message: err.message
        })
    })
}
const updateWallet = async (req, res) => {
    const walletId = req.params.id;
    const isValidWalletId = await helper.isValidObjectID(walletId);
    if(!isValidWalletId) return res.status(400).json({
        message: "Invalid wallet id"
    })
    const existWallet = await Wallet.findById(walletId); 
    if(!existWallet) return res.status(404).json({
        message: "Wallet is not found"
    })
    if(req.body.name){
        const existingWallet = await Wallet.fin({name: new RegExp(`^${req.body.name.trim()}$`, 'i')});
        if(existingWallet && existWallet._id!=existingWallet._id) return res.status(400).json({
            message: "Wallet is existed"
        });
    }
    await Wallet.findByIdAndUpdate(walletId, req.body).catch((err)=>{
        return res.status(400).json({
            message: err.message
        })
    });
    return res.json({
        message: "Updated successfully"
    });
}

const deleteWallet = async (req, res) => {
    const walletId = req.body.walletId;
    const userId = req.body.userId;

    const isValidId = await helper.isValidObjectID(walletId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid wallet id"
    })
    const existWallet = await Wallet.findById(walletId);
    if(!existWallet) return res.status(404).json({
        message: "Wallet is not found"
    })

    const isValidUserId = await helper.isValidObjectID(userId);
    if(!isValidUserId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId)
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const existUW = await UserWallet.find({ walletId: walletId, userId: userId });
    if(existUW.length == 0) return res.status(404).json({
        message: "User is not in this wallet"
    })
    const isCreator = existUW[0].isCreator; 
    const isSharing = existWallet.isSharing;
    await UserWallet.deleteOne({ walletId: walletId, userId: userId }).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong when deleting UserWallet: " + err.message
        })
    });

    if(isSharing){
        if(isCreator){
            await UserWallet.findOneAndUpdate({ walletId: walletId }, { isCreator: true }).catch((err)=>{
                return res.status(400).json({
                    message: "Something went wrong when updating UserWallet: " + err.message
                })
            });
        }
        const transactions = await Transaction.find({ walletId: walletId, userId: userId });

        // Loop through each transaction
        for (let transaction of transactions) {

            const old = transaction;
            // Delete the transaction
            await Transaction.findByIdAndDelete(old._id).then(async ()=>{
                const existWallet = await Wallet.findById(walletId);
                if(['Khoản thu', 'Đi vay', 'Thu nợ'].includes(old.type)){
                    existWallet.amount -= old.spend;
                }
                else{
                    existWallet.amount += old.spend;
                }
                await existWallet.save();                
            }).catch(err => {
                return res.status(500).json({
                    message: err.message
                })
            })
        }
    }

    if(!isSharing && isCreator){
        await Transaction.deleteMany({ walletId: walletId }).catch((err)=>{
            return res.status(400).json({
                message: "Something went wrong when deleting Transaction: " + err.message
            })
        });
        await Wallet.findByIdAndDelete(walletId).catch((err)=>{
            return res.status(400).json({
                message: "Something went wrong when deleting Wallet: " + err.message
            })
        });

    }
    
    return res.json({
        message: "Deleted successfully"
    });
}

const addMember = async(req, res)   => {
    const walletId = req.body.walletId;
    const userId = req.body.userId;
    const isValidId = await helper.isValidObjectID(walletId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid wallet id"
    })
    const existWallet = await Wallet.findById(walletId);
    if(!existWallet) return res.status(404).json({
        message: "Wallet is not found"
    })
    if(!existWallet.isSharing) return res.status(400).json({
        message: "This wallet is not sharing"
    })

    const isValidUserId = await helper.isValidObjectID(userId);
    if(!isValidUserId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not founded"
    })
    const existUW = await UserWallet.findOne({ walletId: walletId, userId: userId });
    if(!existUW) return res.status(400).json({
        message: "You not in this wallet"
    })
    if(!existUW.isCreator) return res.status(400).json({
        message: "You are not creator"
    })

    const email = req.body.inviteUserMail;
    const isValidEmail = await helper.isValidEmail(email);
    if(!isValidEmail) return res.status(400).json({
        message: "Invalid email"
    })
    const exist = await User.findOne({email: email});
    if(!exist) return res.status(404).json({
        message: "Email is not found as a user"
    })
    const message = `${existUser.userName} mời bạn vào quỹ ${existWallet.name}`;
    const request = new Request({
        senderId: userId,
        receiverId: exist._id,
        walletId: walletId,
        createAt: Date.now(),
        name: message
    });
    const newRequest = new Request(request);
    await newRequest.save().catch(err=>{
        return res.status(500).json({
            message: err.message
        })
    });
    return res.json({
        message: "Request successfully"
    })
}
const removeMember = async(req, res)   => {
    const walletId = req.body.walletId;
    const userId = req.body.userId;
    const removeUserId = req.body.removeUserId;
    const isValidId = await helper.isValidObjectID(walletId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid wallet id"
    })
    const existWallet = await Wallet.findById(walletId);
    if(!existWallet) return res.status(404).json({
        message: "Wallet is not found"
    })

    const isValidUserId = await helper.isValidObjectID(userId);
    if(!isValidUserId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId)
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })

    const isValidRMUserId = await helper.isValidObjectID(removeUserId);
    if(!isValidRMUserId) return res.status(400).json({
        message: "Invalid remove user id"
    })
    const existRMUser = await User.findById(removeUserId)
    if(!existRMUser) return res.status(404).json({
        message: "Remove user is not found"
    })
    const existUW = await UserWallet.findOne({ walletId: walletId, userId: userId })
    if(!existUW) return res.status(404).json({
        message: "User is not in this wallet"
    })
    if(!existUW.isCreator) return res.status(400).json({
        message: "You is not creator of this wallet"
    })
    await UserWallet.deleteOne({ walletId: walletId, userId: removeUserId }).catch((err)=>{
        return res.status(400).json({
            message: "Something went wrong when deleting UserWallet: " + err.message
        })
    });
    const request = new Request({
        senderId: userId,
        receiverId: removeUserId,
        walletId: null,
        createAt: Date.now(),
        name: `${existUser.userName} xóa bản khỏi quỹ ${existWallet.name}`
    });
    const newRequest = new Request(request);
    await newRequest.save().catch(err=>{
        return res.status(400).json({
            message: err.message
        })
    });
    return res.json({
        message: "Remove successfully"
    });
}
const getTransactions = async (req, res) => {
    const walletId = req.params.id;
    const isValidWalletId = await helper.isValidObjectID(walletId);
    if(!isValidWalletId) return res.status(400).json({
        message: "Invalid wallet id"
    })
    const existWallet = await Wallet.findById(walletId);
    if(!existWallet) return res.status(404).json({
        message: "Wallet is not found"
    })
    const transactions = await Transaction.find({ walletId: walletId });

    const transactionsWithDetails = await Promise.all(transactions.map(async (item) => {
        let transactionObj = item.toObject();
        transactionObj.user = await User.findById(item.userId).select('-password');
        transactionObj.category = await Category.findById(item.categoryId);
        return transactionObj;
    }));

    return res.json({
        message: "Get transactions successfully",
        data: transactionsWithDetails
    });
}
module.exports = {addNewWallet, updateWallet, deleteWallet, addMember, removeMember, getTransactions};