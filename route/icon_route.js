const iconController = require('../controller/icon_controller');
const express = require('express');
const route = express.Router();

route.get('/all', iconController.getAllIcons);
route.get('/:id', iconController.getIconById);

module.exports = route;