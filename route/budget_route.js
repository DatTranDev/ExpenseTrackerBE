const budgetController = require('../controller/budget_controller');
const express = require('express');
const route = express.Router();

route.post('/add', budgetController.addNewBudget);
route.patch('/update/:id', budgetController.updateBudget);
route.delete('/delete', budgetController.deleteBudget);

module.exports = route;

