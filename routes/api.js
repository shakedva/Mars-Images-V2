const express = require('express');
const apiController = require('../controllers/apiController');
const router = express.Router();

router.post('/search/:email', apiController.postSearchEmail);

router.post('/image', apiController.postAddImage);

router.get('/image', apiController.getImages);

router.delete('/image/:id', apiController.deleteAnImage);

router.delete('/image', apiController.deleteAllImages);

module.exports = router;
