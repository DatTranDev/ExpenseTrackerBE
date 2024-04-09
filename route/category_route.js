const { model } = require('mongoose');
const categoryController = require('../controller/category_controller');
const express = require('express');
const route = express.Router();

route.post('/add', categoryController.addNewCategory);
route.delete('/delete', categoryController.deleteCategory);

module.exports = route;
