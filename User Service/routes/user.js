const { body } = require('express-validator');
const { Router } = require('express');

const User = require('../models/user');
const userController = require('../controllers/user');
const Auth = require('../controllers/auth');
const ROLES = require('../models/roles');
const STATUS = require('../models/status');

const router = Router();

//route to register a user
//POST /user/register
router.post('/register',
  // array of validation methods to check the user fields (ex.> name, email...etc)
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

//route to login a user
//POST /user/login
router.post('/login', userController.login);

//route to fetch user(s)
//accessible to SUPER-ADMIN only
//GET /user/get-users 
//To fetch a single user append query parameter with id ex.> /user/get-users?id=userId
router.get('/get-users', Auth.authenticateToken, Auth.authRole(ROLES.SUPER_ADMIN), userController.getUsers);

//route to modify user
//accessible to SUPER-ADMIN only
//PUT /user/update-user-permission/userId
router.put('/update-user-permission/:id',
  [
    body('role')
      .trim()
      .custom((role, { req }) => {
        for (let [key, value] of Object.entries(ROLES)) {
          if (value.toString() === role.toString()) {
            return true;
          }
        }
      })
      .withMessage('Enter a valid value for role'),
    body('status')
      .trim()
      .custom((status, { req }) => {
        for (let [key, value] of Object.entries(STATUS)) {
          if (value.toString() === status.toString()) {
            return true;
          }
        }
      })
      .withMessage('Enter a valid value for status')
  ],
  Auth.authenticateToken, Auth.authRole(ROLES.SUPER_ADMIN), userController.updateUserPermissions)

//route to fetch all users favourite books
//accessible to USER only
//GET /user/favourite-books
router.get('/favourite-books', Auth.authenticateToken, Auth.authRole(ROLES.USER), userController.getFavouriteBooks);

//route to add a favourite book to the user
//accessible to USER only
//POST /user/add-favourite-book
router.post('/add-favourite-book', Auth.authenticateToken, Auth.authRole(ROLES.USER), userController.addFavouriteBook);

//route to remove a favourite book from the user
//accessible to USER only
//POST /user/remove-favourite-book
router.post('/remove-favourite-book', Auth.authenticateToken, Auth.authRole(ROLES.USER), userController.removeFavouriteBook);

module.exports = router;