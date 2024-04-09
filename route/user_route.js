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
route.post("/getcategory/:id", userController.getCategoryByUser);
route.post("/getwallet/:id", userController.getWalletByUser);
route.post("/gettransaction/:id", userController.getTransactionByUser);
route.post("/getbudget/:id", userController.getBudgetByUser);

module.exports = route;