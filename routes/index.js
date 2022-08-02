var express = require('express');
var router = express.Router();
const indexControllers = require('../controllers/indexController');

router.get('/', indexControllers.getIndex);

router.post('/', indexControllers.postIndex);

router.post('/login', indexControllers.postLogin);

router.get('/login', indexControllers.getLogin);

router.get('/logout', indexControllers.logout);

router.post('/logout', indexControllers.logout);

module.exports = router;
