const userController = require('../controller/user_controller');
const express = require('express');
const route = express.Router();

route.post('/register', userController.register);
route.post('/login', userController.login);
route.patch('/changepassword', userController.changePassword);
route.delete('/delete/:id', userController.deleteUser);
route.patch('/update/:id', userController.updateUser);
route.get("/find/email", userController.getUserByEmail);
route.get("/findbyid/:id", userController.getUserById);
route.post("/logout", userController.logOut);
route.get("/getcategory/:id", userController.getCategoryByUser);
route.get("/getwallet/:id", userController.getWalletByUser);
route.get("/getsharingwallet/:id", userController.getSharingWalletByUser);
route.get("/gettransaction/:id", userController.getTransactionByUser);
route.get("/getbudget/:id", userController.getBudgetByUser);

module.exports = route;