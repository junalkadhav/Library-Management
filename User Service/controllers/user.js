const axios = require('axios');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Roles = require('../models/roles');
const Status = require('../models/status');

const register = async (req, res, next) => {

  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      name: name,
      email: email,
      password: hashedPw,
      role: email.toString() === process.env.SUPER_ADMIN_EMAIL ? Roles.superAdmin : Roles.user
    })
    const registeredUser = await user.save();
    res.status(201).json({ message: "user registered successfully", userId: registeredUser._id });
  }
  catch (err) {
    next(err);
  }
}

const login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email })
    if (!user) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }
    if (user.status.toString() === Status.disabled) {
      const error = new Error('Your account is disabled, Contact Adminstrator');
      error.statusCode = 403;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JSON_TOKEN_SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.status(200).json({ message: 'login success', token: token });
  }
  catch (err) {
    next(err);
  }
}

const getFavouriteBooks = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)

    let bookIds = "";
    user.favourites.forEach(item => {
      bookIds += item.bookId + ',';
    })
    bookIds = bookIds.slice(0, -1)
    console.log(bookIds);

    let favBooks;
    if (bookIds.trim() !== "") {
      const response = await axios.get('http://localhost:4000/book/get-books?id=' + bookIds);
      favBooks = response.data.books;
    }
    else {
      favBooks = [];
    }

    res.status(200).json({ message: "fetch successfull", favBooks: favBooks });
  }
  catch (err) {
    next(err);
  }
}

const addFavouriteBook = async (req, res, next) => {
  const bookId = req.body.bookId;
  try {

    const currentUser = await User.findById(req.userId);

    //check if book exists in favourites already
    currentUser.favourites.forEach(item => {
      if (item.bookId.toString() === bookId.toString()) {
        const err = new Error('Book aready added to favourites')
        err.statusCode = 400;
        throw err;
      }
    })
    //if got no error then add it to favs
    currentUser.favourites.push({ bookId: bookId });
    const user = await currentUser.save();
    res.status(200).json({ message: "Added book to favourites successfully" });
  }
  catch (err) {
    next(err);
  }
}

const removeFavouriteBook = async (req, res, next) => {
  const bookId = req.body.bookId;
  console.log(bookId);
  try {
    const currentUser = await User.findById(req.userId);
    let isFavourite = false;
    const newFavourites = currentUser.favourites.filter(item => {
      if (item.bookId.toString() !== bookId.toString()) {
        return item;
      } else {
        isFavourite = true;
      }
    })
    currentUser.favourites = newFavourites;
    await currentUser.save();
    if (isFavourite) {
      res.status(200).json({ message: "Removed book from favourites" });
    }
    else {
      const err = new Error('Book does not exist in favourites');
      err.statusCode = 400;
      throw err;
    }
  }
  catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getFavouriteBooks,
  addFavouriteBook,
  removeFavouriteBook
}