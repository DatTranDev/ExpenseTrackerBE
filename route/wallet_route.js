const walletController = require('../controller/wallet_controller');
const express = require('express');
const route = express.Router();

route.post('/add', walletController.addNewWallet);
route.delete('/delete', walletController.deleteWallet);

module.exports = route;