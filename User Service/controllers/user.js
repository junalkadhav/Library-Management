const axios = require('axios');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const ROLES = require('../models/roles');
const Status = require('../models/status');

/**
 * Registers user/Adds user to database
 * *Accessible by everyone
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
      role: email.toString() === process.env.SUPER_ADMIN_EMAIL ? ROLES.SUPER_ADMIN : ROLES.USER
    })
    const registeredUser = await user.save();
    res.status(201).json({ message: "user registered successfully", userId: registeredUser._id });
  }
  catch (err) {
    next(err);
  }
}

/**
 * Logs in the user if provided credentials are valid
 * *Accessible by everyone
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object response with token value
 */
const login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email })
    //checking if user exists
    if (!user) {
      const error = new Error('A user with this email could not be found.');//change it to invalid email or pass
      error.statusCode = 401;
      throw error;
    }
    //checking user status
    if (user.status.toString() === Status.disabled) {
      const error = new Error('Your account is disabled, Contact Adminstrator');
      error.statusCode = 403;
      throw error;
    }
    //compairng the user password
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');//change it to invalid email or pass
      error.statusCode = 401;
      throw error;
    }
    //creating a new token upon passing above checks
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JSON_TOKEN_SECRET_KEY,
      { expiresIn: '10h' }
    );
    res.status(200).json({ message: 'login success', token: token });//returning the token
  }
  catch (err) {
    next(err);
  }
}

/**
 * Fetches all user favourite books based on bookId's stored in user's favourite book collection
 * *Accessible by USERS
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object response (Book(s))
 */
const getFavouriteBooks = async (req, res, next) => {
  try {
    //fetching and validating current user
    const user = await User.findById(req.userId)
    isUserValid(user);

    //creating a string of all favourite book id's seperated with ","
    let bookIds = "";
    user.favourites.forEach(item => {
      bookIds += item.bookId + ',';
    });
    bookIds = bookIds.slice(0, -1);
    //console.log(bookIds);

    let favBooks = [];
    //if book id's exist then:
    if (bookIds.trim() !== "") {
      try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
          const error = new Error('Not authenticated.');
          error.statusCode = 401;
          throw error;
        }
        //make a call to book service to fetch the book with ids
        const response = await axios.get(process.env.BOOK_SERVICE_URL + '/get-books?id=' + bookIds, {
          headers: {
            Authorization: authHeader
          }
        });
        favBooks = response.data.books;
      }
      catch (err) {
        //if a service(call via axios) is up and running the error data is present inside response object else directly throwing it
        if (err.response) {
          err.message = err.response.data.message;
          err.statusCode = err.response.status;
        }
        throw err;
      }
    }
    return res.status(200).json({ message: "fetch successfull", favBooks: favBooks });
  }
  catch (err) {
    next(err);
  }
}

/**
 * Adds a book id to user's favourite book collection
 * *Accessible by USERS
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json response object
 */
const addFavouriteBook = async (req, res, next) => {
  const bookId = req.body.bookId;
  try {

    //fetching and validating current user
    const currentUser = await User.findById(req.userId);
    isUserValid(currentUser);

    //check if book exists in favourites already
    for (let i = 0; i < currentUser.favourites.length; i++) {
      if (currentUser.favourites[i].bookId.toString() === bookId.toString()) {
        return res.status(400).json({ message: "Book aready in favourites" });
      }
    }
    //if got no error then add it to favs
    currentUser.favourites.push({ bookId: bookId });
    await currentUser.save();
    return res.status(200).json({ message: "Added book to favourites successfully" });
  }
  catch (err) {
    next(err);
  }
}

/**
 * Removes a book id from user's favourite book collection
 * *Accessible by USERS
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json response object 
 */
const removeFavouriteBook = async (req, res, next) => {
  const bookId = req.body.bookId;
  //console.log(bookId);
  try {
    //fetching and validating current user
    const currentUser = await User.findById(req.userId);
    isUserValid(currentUser);

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
    await currentUser.save();
    if (isFavourite) {
      return res.status(200).json({ message: "Removed book from favourites" });
    }
    return res.status(404).json({ message: 'Book does not exist in favourites' });
  }
  catch (err) {
    next(err);
  }
}

/**
 * Fetches User(s) from the database
 * *Accessible by SUPER-ADMIN
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json response object 
 */
const getUsers = async (req, res, next) => {
  const id = req.query.id;
  try {
    if (id) {
      try {
        const user = await User.findById({ _id: id }, "-password").select('-favourites');//passing the id to fetch user excluding password
        return res.status(200).json({ message: 'fetched user', user: user });
      }
      catch (err) {
        return res.status(404).json({ message: 'User not found' });
      }
    }
    const users = await User.find().select('-password').select('-favourites');//fetching all users excluding password
    return res.status(200).json({ message: 'fetched users[]', users: users });
  }
  catch (err) {
    next(err);
  }
}

/**
 * Updates user permission and role
 * Accessible by SUPER-ADMIN
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

    let user;
    try {
      //fetch and validate the user
      user = await User.findById(userId)
      isUserValid(user);

      //prevent changing role/status of super admin
      if (user.email === process.env.SUPER_ADMIN_EMAIL) {
        return res.status(403).json({ message: 'Cannot update Super Admin' });
      }
    }
    catch (err) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = req.body.role;
    user.status = req.body.status;
    updatedUser = await user.save();
    return res.status(200).json({ message: 'Updated User Status/Role ', role: updatedUser.role, status: updatedUser.status });
  }
  catch (err) {
    next(err);
  }
}

/**
 * This method validates wether the request body input's are valid as defined in routes, if not throws error.
 * @param {Request} req - incoming request object
 */
const validateBodyFields = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
}

/**
 * Throws error if user is not valid
 * @param {object} user - user object based on mongoose model
 */
const isUserValid = (user) => {
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
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