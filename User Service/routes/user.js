const { body } = require('express-validator');
const { Router } = require('express');

const User = require('../models/user');
const userController = require('../controllers/user');
const Auth = require('../auth/auth');

const router = Router();

router.post('/register',
  [
    body('name', 'Name should contain only alphabets (min:3,max:8)')
      .trim()
      .isAlpha('en-US', { ignore: ' ' })
      .isLength({ min: 3, max: 8 }),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail().withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!')
          }
        });
      }),
    body('password')
      .trim()
      .isLength({ min: 8, max: 16 })
      .withMessage('Password should be min:8 max:16')
  ],
  userController.register);

router.post('/login', userController.login);

router.get('/favourite-books', Auth.authUser, userController.getFavouriteBooks);

router.post('/add-favourite-book', Auth.authUser, userController.addFavouriteBook);

router.post('/remove-favourite-book', Auth.authUser, userController.removeFavouriteBook);

module.exports = router;