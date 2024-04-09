const requestController = require('../controller/request_controller');
const express = require('express');
const route = express.Router();

route.post('/response', requestController.response);

module.exports = route;