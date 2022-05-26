const { Router } = require('express');

const userController = require('../controllers/user');

const router = Router();

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/favourite-books', userController.getFavouriteBooks);

router.post('/add-favourite-book', userController.addFavouriteBook);

router.post('/remove-favourite-book', userController.removeFavouriteBook);

module.exports = router;