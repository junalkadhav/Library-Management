const { body } = require('express-validator');
const { Router } = require('express');

const User = require('../models/user');
const userController = require('../controllers/user');
const auth = require('../controllers/auth');
const ROLES = require('../models/roles');
const STATUS = require('../models/status');

const router = Router();

//#region Validation Arrays

// array of validation methods to check the user registration fields (ex.> name, email...etc)
const validateUserRegistrationFields = [
  //validating name value
  body('name', 'Name should contain only alphabets (min:3,max:20)')
    .trim()
    .isAlpha('en-US', { ignore: ' ' })
    .isLength({ min: 3, max: 20 }),
  //validating email value
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
  //validating password value
  body('password')
    .trim()
    .isLength({ min: 8, max: 16 })
    .withMessage('Password should be min:8 max:16')
];

// array of validation methods to check the user permission fields (ex.> name, email...etc)
const validateUserPermissionFields = [
  //validating role value
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
  //validating status value
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
];

//#endregion

//#region Routes

//route to register a user
//*Accessible to EVERY-ONE
//POST /user/register
router.post('/register', validateUserRegistrationFields, userController.register);

//route to login a user
//*Accessible to EVERY-ONE
//POST /user/login
router.post('/login', userController.login);

//route to fetch user(s)
//*Accessible to SUPER-ADMIN only
//To fetch a single user append query parameter with id ex.> /user/get-users?id=userId
//GET /user/get-users 
router.get('/get-users', auth.authenticateToken, auth.authorizeUserRole(ROLES.SUPER_ADMIN), userController.getUsers);

//route to modify user
//*Accessible to SUPER-ADMIN only
//PUT /user/update-user-permission/userId
router.put('/update-user-permission/:id', validateUserPermissionFields, auth.authenticateToken, auth.authorizeUserRole(ROLES.SUPER_ADMIN), userController.updateUserPermissions)

//route to fetch all user's favourite book(s)
//*Accessible to USER only
//GET /user/favourite-books
router.get('/favourite-books', auth.authenticateToken, auth.authorizeUserRole(ROLES.USER), userController.getFavouriteBooks);

//route to add a favourite book to the user
//*Accessible to USER only
//POST /user/add-favourite-book
router.post('/add-favourite-book', auth.authenticateToken, auth.authorizeUserRole(ROLES.USER), userController.addFavouriteBook);

//route to remove a favourite book from the user
//*Accessible to USER only
//POST /user/remove-favourite-book
router.post('/remove-favourite-book', auth.authenticateToken, auth.authorizeUserRole(ROLES.USER), userController.removeFavouriteBook);

//#endregion

module.exports = router;