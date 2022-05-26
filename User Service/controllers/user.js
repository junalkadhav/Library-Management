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
    next(err);
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
    next(err);
  }
}

const getFavouriteBooks = async (req, res, next) => {
  try {
    const user = await User.findById('628e0f8aab8dd3469bcf2dcf')

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

    const currentUser = await User.findById('628e0f8aab8dd3469bcf2dcf');

    currentUser.favourites.forEach(item => {
      if (item.bookId.toString() === bookId.toString()) {
        const err = new Error('book aready added to favourite')
        err.statusCode = 400;
        throw err;
      }
    })

    currentUser.favourites.push({ bookId: bookId });
    const user = await currentUser.save();
    res.status(200).json({ message: "added favourite book successfully", response: user });
  }
  catch (err) {
    next(err);
  }
}

const removeFavouriteBook = async (req, res, next) => {
  const bookId = req.body.bookId;
  console.log(bookId)
  const currentUser = await User.findById('628e0f8aab8dd3469bcf2dcf');
  let isFavourite = false;
  const newFavourites = currentUser.favourites.filter(item => {
    if (item.bookId.toString() !== bookId.toString()) {
      return item;
    } else {
      isFavourite = true;
    }
  })

  currentUser.favourites = newFavourites;
  const user = await currentUser.save();
  if (isFavourite) {
    res.status(200).json({ message: "removed book from favourites", response: user });
  }
  else {
    res.status(200).json({ message: "book is not there in favourites", response: user });
  }

}

module.exports = {
  register,
  login,
  getFavouriteBooks,
  addFavouriteBook,
  removeFavouriteBook
}