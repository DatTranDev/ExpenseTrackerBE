const requestController = require('../controller/request_controller');
const express = require('express');
const route = express.Router();


route.post('/response', requestController.response);
route.get('/getbyuser/:id', requestController.getByUser);

module.exports = route;