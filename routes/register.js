const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

router.get('/', registerController.register);

router.post('/', registerController.register);

router.post('/password', registerController.postPassword);

router.get('/password', registerController.getPassword);

module.exports = router;
