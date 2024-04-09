const Wallet = require('../model/Wallet.js');
const User = require('../model/User.js');
const UserWallet = require('../model/UserWallet.js');
const Request = require('../model/Request.js');
const helper = require('../pkg/helper/helper.js');

const addNewWallet = async (req, res) => {
    let listUserEmail; let check = false;
    let listUserId = [];
    if (req.isSharing){
        check = true;
        //Find and get user id from email
        listUserEmail = req.body.inviteUserMail;
        listUserEmail.forEach( async (userMail) => {
            const isValidEmail = await helper.isValidEmail(userMail);
            if(!isValidEmail) return res.status(400).json({
                message: "Invalid email"
            });
            const existUser = await User.findOne({email: userMail}).select('-password');
            if(!existUser) return res.status(404).json({
                message: "User is not found"
            })
            else{
                listUserId.push(existUser._id);
            }
        });
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

    const wallet = new Wallet({
        name: req.body.name,
        amount: req.body.amount,
        isSharing: req.body.isSharing
    });
    const newWallet = new Wallet(wallet);
    await newWallet.save().then((data)=>{
        const walletData = data;
        const userWallet = new UserWallet({
            userId: userId,
            walletId: data._id
        });
        const newUserWallet = new UserWallet(userWallet);
        newUserWallet.save().then(()=>{
            if(check){
                //Send request to other users
                listUserId.forEach( async (receiverId) => {
                    const request = new Request({
                        senderId: userId,
                        receiverId: receiverId,
                        walletId: data._id,
                        name: data.name
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
                message: !check? "Wallet is created successfully": "Wallet is created successfully and send request successfully",
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
    let check =  existWallet.isSharing;

    const isValidUserId = await helper.isValidObjectID(userId);
    if(!isValidUserId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })

    try {
        // Delete all UserWallet and Request documents that have the walletId
        await UserWallet.deleteMany({ walletId: walletId, userId: userId }).catch((err)=>{
            return res.status(400).json({
                message: "Something went wrong when deleting UserWallet: " + err.message
            })
        });
        await Request.deleteMany({ walletId: walletId }).catch((err)=>{
            return res.status(400).json({
                message: "Something went wrong when deleting Request: " + err.message
            })
        });
        if(!check)
        await Wallet.findByIdAndDelete(walletId).catch((err)=>{
            return res.status(400).json({
                message: "Something went wrong when deleting Wallet: " + err.message
            })
        });
        return res.json({
            message: "Deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {addNewWallet, deleteWallet};