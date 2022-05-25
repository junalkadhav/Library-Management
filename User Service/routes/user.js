const { Router } = require('express');

const userController = require('../controllers/user');

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/favourite-books', userController.favourites);

module.exports = router;