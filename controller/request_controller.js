const UserWallet = require('../model/UserWallet.js');
const Request = require('../model/Request.js');
const helper = require('../pkg/helper/helper.js');
const User = require('../model/User.js');
const { get } = require('mongoose');

const response = async (req, res) => {
    const requestId = req.body.requestId;
    const accept = req.body.isAccepted;
    const isValidId = await helper.isValidObjectID(requestId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid request id"
    })
    const existRequest = await Request.findById(requestId);
    if(!existRequest) return res.status(404).json({
        message: "Request is not found"
    })
    if(accept){
        const userWallet = new UserWallet({
            userId: existRequest.receiverId,
            walletId: existRequest.walletId,
            isCreator: false
        })
        await userWallet.save()
    }
    await Request.findByIdAndDelete(requestId);
    return res.json({
        message: "Response successfully"
    })  
    
}

const getByUser = async (req, res) => {
    const userId = req.params.id;
    const isValidId = await helper.isValidObjectID(userId);
    if(!isValidId) return res.status(400).json({
        message: "Invalid user id"
    })
    const existUser = await User.findById(userId).select('-password')
    if(!existUser) return res.status(404).json({
        message: "User is not found"
    })
    const requests = await Request.find({
        receiverId: userId
    })
    return res.json({
        data: requests
    })
}

module.exports = {
    response,
    getByUser
}