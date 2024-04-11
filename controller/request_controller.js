const UserWallet = require('../model/UserWallet.js');
const Request = require('../model/Request.js');
const helper = require('../pkg/helper/helper.js');

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

module.exports = {
    response
}