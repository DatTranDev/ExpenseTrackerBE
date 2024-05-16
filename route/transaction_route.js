const transactionController = require('../controller/transaction_controller');
const express = require('express');
const route = express.Router();

route.post('/add', transactionController.addTransaction);
route.delete('/delete/:id', transactionController.deleteTransaction);
route.patch('/update/:id', transactionController.updateTransaction);
route.get('/getneedtopay/:id', transactionController.getNeedToPay);
route.get('/getneedtoreceive/:id', transactionController.getNeedToReceive);

module.exports = route;