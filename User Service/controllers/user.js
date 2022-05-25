const axios = require('axios');

const User = require('../models/user');

const register = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;

  const user = new User({
    name: name,
    email: email,
    password: password,
    role: role
  })
  try {
    const registeredUser = await user.save();
    res.status(201).json({ message: "user registered successfully", user: registeredUser });
  }
  catch (err) {
    console.log(err);
  }
}

const login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(401).json({ message: 'invalid email' })
    }
    if (user.password !== password) {
      return res.status(401).json({ message: 'invalid password' })
    }
    res.status(200).json({ message: "login successfull" });
  }
  catch (err) {
    console.log(err);
  }
}

const getFavouriteBooks = async (req, res, next) => {
  const favourites = '1,2,3,4'
  const response = await axios.get('http://localhost:4000/book/get-books?favourites=' + favourites)

  res.status(200).json({ message: "reaching favourite-books route", response: response.data });
}

const addFavouriteBook = async (req, res, next) => {
  const bookId = req.body.bookId;
  const currentUser = await User.findById('628e0f8aab8dd3469bcf2dcf');

  currentUser.favourites.push({ bookId: bookId });
  const user = currentUser.save();
  //console.log(user);

  res.status(200).json({ message: "reaching favourite-books route", response: user });
}

module.exports = {
  register,
  login,
  getFavouriteBooks,
  addFavouriteBook
}