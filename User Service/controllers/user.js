const axios = require('axios');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const ROLES = require('../models/roles');
const Status = require('../models/status');

/**
 * Registers user/Adds user to database
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object response
 */
const register = async (req, res, next) => {
  try {
    //validating the user fields (name,email,..etc)
    validateBodyFields(req);

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, 12);//hashing the password
    const user = new User({
      name: name,
      email: email,
      password: hashedPw,
      //assigning role of super admin if the email matches the super-admin email defined in the environmental variable,else  user role 
      role: email.toString() === process.env.SUPER_ADMIN_EMAIL ? ROLES.SUPER_ADMIN : ROLES.USER
    })
    try {
      const registeredUser = await user.save();
      return res.status(201).json({ message: "user registered successfully", userId: registeredUser._id });
    }
    catch (err) {
      throwDatabaseError();
    }
  }
  catch (err) {
    return errorHandler(err, next);
  }
}

/**
 * Logs in the user if provided credentials are valid
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object response with token value
 */
const login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    let user;
    try {
      user = await User.findOne({ email: email });
    }
    catch (err) {
      throwDatabaseError();
    }
    //checking if user exists
    if (!user) {
      throwCustomError('Invalid email or password', 401);
    }
    //checking user status
    if (user.status.toString() === Status.disabled) {
      throwCustomError('Your account is disabled, Contact Adminstrator', 403);
    }
    //compairng the user password
    let isEqual;
    try {
      isEqual = await bcrypt.compare(password, user.password);
    }
    catch (err) {
      throwCustomError('Could not login due to some technical issues', 500);
    }
    if (!isEqual) {
      throwCustomError('Invalid email or password', 401);
    }
    //creating a new token after passing above checks
    try {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
          role: user.role,
        },
        process.env.JSON_TOKEN_SECRET_KEY,
        { expiresIn: '10h' }
      );
      return res.status(200).json({ message: 'Login Success!', token: token });//returning the token
    }
    catch (err) {
      throwCustomError('Could not login due to some technical issues', 500);
    }
  }
  catch (err) {
    return errorHandler(err, next);
  }
}

/**
 * Fetches all user favourite books based on bookId's stored in user's favourite book collection
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object response (Book(s))
 */
const getFavouriteBooks = async (req, res, next) => {
  try {
    //fetch user and validate current user id
    const user = await isUserValid(req.userId);

    //query params to navigate through pages
    const currentPage = req.query.page || 1; //if undefined set to 1st page

    //creating a string of all favourite book id's seperated with ","
    let bookIds = "";
    user.favourites.forEach(item => {
      bookIds += item.bookId + ',';
    });
    bookIds = bookIds.slice(0, -1);
    //console.log(bookIds);

    let favBooks = [];
    let totalfavouriteBooks = 0;
    //if book id's exist then:
    if (bookIds.trim() !== "") {
      try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
          throwCustomError('Not authenticated.', 401);
        }
        //make a call to book service to fetch the book with ids also pass current page to fetch data according to pagination
        const response = await axios.get(process.env.BOOK_SERVICE_URL + `/get-books?id=${bookIds}&page=${currentPage}`, {
          headers: {
            Authorization: authHeader
          }
        });
        favBooks = response.data.books;
        totalfavouriteBooks = response.data.totalBooks;
      }
      catch (err) {
        //if axios serivce call fails then erorr data is inside err.response object extracting that data
        if (err.response) {
          err.statusCode = err.response.status;
          if (err.response.data.message) {
            err.message = err.response.data.message
          } else {
            err.message = err.response.statusText;
          }
        }
        throw err;
      }
    }
    return res.status(200).json({ message: "fetch successfull", totalfavouriteBooks: totalfavouriteBooks, favBooks: favBooks });
  }
  catch (err) {
    return errorHandler(err, next);
  }
}

/**
 * Adds a book id to user's favourite book collection
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json response object
 */
const addFavouriteBook = async (req, res, next) => {
  const bookId = req.body.bookId;
  try {

    //fetch user and validate current user id
    const currentUser = await isUserValid(req.userId);

    //check if book exists in favourites already
    for (let i = 0; i < currentUser.favourites.length; i++) {
      if (currentUser.favourites[i].bookId.toString() === bookId.toString()) {
        return res.status(400).json({ message: "Book aready in favourites" });
      }
    }
    //if got no error and book id is valid then add it to favs
    if (User.validateObjectId(bookId)) {
      currentUser.favourites.push({ bookId: bookId });
      try {
        await currentUser.save();
      }
      catch (err) {
        throwDatabaseError();
      }
    }
    else {
      return res.status(404).json({ message: 'Cannot add invalid Book to favourites' });
    }
    return res.status(200).json({ message: "Added book to favourites successfully" });
  }
  catch (err) {
    return errorHandler(err, next);
  }
}

/**
 * Removes a book id from user's favourite book collection
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json response object 
 */
const removeFavouriteBook = async (req, res, next) => {
  const bookId = req.body.bookId;
  //console.log(bookId);
  try {
    //fetch user and validate current user id
    const currentUser = await isUserValid(req.userId);

    let isFavourite = false;
    let newFavourites = [...currentUser.favourites];
    newFavourites = newFavourites.filter(item => {
      if (item.bookId.toString() !== bookId.toString()) {
        return item;
      } else {
        isFavourite = true;
      }
    })
    currentUser.favourites = newFavourites;
    try {
      await currentUser.save();
    }
    catch (err) {
      throwDatabaseError();
    }
    if (isFavourite) {
      return res.status(200).json({ message: "Removed book from favourites" });
    }
    return res.status(404).json({ message: 'Book does not exist in favourites' });
  }
  catch (err) {
    return errorHandler(err, next);
  }
}

/**
 * Fetches User(s) from the database (Get's a particular user based on id if present) else, fetch's all users
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json response object 
 */
const getUsers = async (req, res, next) => {
  let ids = req.query.id ? req.query.id.trim() : ''; //user id(s) to fetch
  let findCondition = {};

  //if the ids are not empty then add "_id" property to findCondition object and assign it ids
  if (ids) {
    ids = ids.split(','); //if multiple ids are present split them so to pass it to "User.find()" method
    findCondition = { _id: ids };
  }
  try {
    const users = await User.find(findCondition).select('-password').select('-favourites');//fetching all users excluding their sensitive data
    return res.status(200).json({ message: 'Fetched users!', users: users });
  }
  catch (err) {
    return res.status(404).json({ message: 'User(s) not found!' });
  }
}

/**
 * Updates user permission and role
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json response object 
 */
const updateUserPermissions = async (req, res, next) => {
  const userId = req.params.id;
  try {
    //validate user fields (ex.> role ,status)
    validateBodyFields(req);

    //fetch user and validate current user id
    const user = await isUserValid(userId);

    //prevent changing role/status of super admin
    if (user.email === process.env.SUPER_ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Cannot update Super Admin!' });
    }

    user.role = req.body.role;
    user.status = req.body.status;
    try {
      const updatedUser = await user.save();
      return res.status(200).json({ message: 'Updated User Status/Role ', role: updatedUser.role, status: updatedUser.status });
    }
    catch (err) {
      throwDatabaseError();
    }
  }
  catch (err) {
    return errorHandler(err, next);
  }
}

/**
 * This method validates wether the request body input's are valid as defined in routes, if not throws error.(helper function)
 * @param {Request} req - incoming request object
 */
const validateBodyFields = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwCustomError('Validation failed!', 422, errors.array());
    // const error = new Error('Validation failed!');
    // error.statusCode = 422;
    // error.data = errors.array();
    // throw error;
  }
}

/**
 * Returns user object if user id is valid, else throws error (helper function)
 * @param {String} userId - user id 
 * @returns {Object} -user mongoose model object
 */
const isUserValid = async (userId) => {
  let user;
  try {
    user = User.validateObjectId(userId) ? await User.findById(userId) : '';
  }
  catch (err) {
    //let the if block handle it (as id is invalid same error should be thrown)
  }
  if (!user) {
    throwCustomError('User not found!', 404);
    // const error = new Error('User not found!');
    // error.statusCode = 404;
    // throw error;
  }
  return user;
}

/**
 * Common error handler which forwards the error to main error handler aslo returns error object (helper funtion)
 * @param {Error} err - error object 
 * @param {Function} next function to make a call to next middleware
 * @returns error object
 */
const errorHandler = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
  return err;
}

/**
 * This method throws error on call with custom message and statusCode
 * @param {String} message - custom message
 * @param {Number} statusCode - custom status code
 * @param {Object} optionalErrorData - any extra info about the error
 */
const throwCustomError = (message, statusCode, optionalErrorData) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (optionalErrorData) {
    error.data = optionalErrorData;
  }
  throw error;
}

/**
 * This method throws error on call which has a error defined for database related operations
 */
const throwDatabaseError = () => {
  throwCustomError('Something went wrong, try again later :(', 500);
}

module.exports = {
  register,
  login,
  getFavouriteBooks,
  addFavouriteBook,
  removeFavouriteBook,
  getUsers,
  updateUserPermissions
}