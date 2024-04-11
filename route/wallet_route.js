const walletController = require('../controller/wallet_controller');
const express = require('express');
const route = express.Router();

route.post('/add', walletController.addNewWallet);
route.patch('/update/:id', walletController.updateWallet);
route.delete('/delete', walletController.deleteWallet);
route.patch('/addmember', walletController.addMember);
route.patch('/removemember', walletController.removeMember);

module.exports = route;