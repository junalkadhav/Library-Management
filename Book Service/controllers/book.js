const axios = require('axios');
const { validationResult } = require('express-validator');

const Book = require('../models/book');
const ROLES = require('../models/roles');

/**
 * Authenticates a request and returns response, throws error if req is unauthenticated. 
 * @param {Request} req - incoming request object
 * @returns response.data
 */
const requestAuthenticator = async (req) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  try {
    const response = await axios.get(process.env.USER_SERVICE_URL + "/authorize", {
      headers: {
        Authorization: authHeader
      }
    })
    return response.data;
  }
  catch (err) {
    if (err.statusCode)
      err.statusCode = err.response.status;
    throw (err);
  }
}

/**
 * Returns (void) if user is authorized, else throws error.
 * @param {string} role - role of the user who made the request.
 * @param  {...string} allowedRoles - allowed roles to match with
 */
const roleAuthorizer = (role, ...allowedRoles) => {
  for (let i = 0; i < allowedRoles.length; i++) {
    if (allowedRoles[i].toString() === role.toString()) {
      return;
    }
  }
  const error = new Error('Not authorized.');
  error.statusCode = 403;
  throw error;
}

/**
 * Checks if book fields are valid, else throws error
 * @param {Request} req - incoming request object
 */
const validateBookFields = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
}

/**
 * Fetches the books, if query params present fethes those books else all books.
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object (books[]) 
 */
const getBooks = async (req, res, next) => {
  try {
    //authenticating & authorizing(role)
    const response = await requestAuthenticator(req);
    roleAuthorizer(response.role, ROLES.USER, ROLES.ADMIN);

    const id = req.query.id  //book id's to fetch
    if (id) {
      //code to create a array of ids, so to pass it to find method
      ids = id.split(',').filter(id => {
        id = id.trim();
        if (id.toString() !== "") {
          return id;
        }
      });
      try {
        const queryedBooks = await Book.find({ _id: ids }); //passing array of id's to fetch them
        return res.status(200).json({ message: 'queryed books successfully', books: queryedBooks });
      }
      catch (err) {
        const error = new Error('Invalid Book'); //if atleast one id is invalid 
        error.statusCode = 404;
        next(error);
      }
    }
    else {
      const books = await Book.find();
      res.status(200).json({ message: 'fetched books successfully', books: books }); //return success response
    }
  }
  catch (err) {
    next(err);
  }
}

/**
 * Creates a new book and returns it.
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object response (Book)
 */
const createBook = async (req, res, next) => {
  try {
    //authenticating & authorizing(role)
    const response = await requestAuthenticator(req);
    roleAuthorizer(response.role, ROLES.ADMIN);

    //validating book fields (title,isbn,.....etc)
    validateBookFields(req);

    const title = req.body.title;
    const isbn = req.body.isbn;
    const publicationYear = req.body.publicationYear;
    const authors = req.body.authors;
    const genres = req.body.genres;
    const awardsWon = req.body.awardsWon;

    const book = new Book({
      title: title,
      isbn: isbn,
      publicationYear: publicationYear,
      authors: authors,
      genres: genres,
      awardsWon: awardsWon
    })
    const createdBook = await book.save();
    res.status(201).json({ message: 'created Book successfully', book: createdBook });
  }
  catch (err) {
    next(err);
  }
}

/**
 * Updates the book with the provided bookId and returns the updated book.
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object response (Book)
 */
const updateBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  try {
    //authenticating & authorizing(role)
    const response = await requestAuthenticator(req);
    roleAuthorizer(response.role, ROLES.ADMIN);

    //validating book fields (title,isbn,.....etc)
    validateBookFields(req);

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Invalid Book!' });
    }

    book.title = req.body.title;
    book.isbn = req.body.isbn;
    book.publicationYear = req.body.publicationYear;
    book.authors = req.body.authors;
    book.genres = req.body.genres;
    book.awardsWon = req.body.awardsWon;

    console.log(book);

    updatedBook = await book.save();
    res.status(200).json({ message: 'reached updateBook routes ', book: updatedBook });
  }
  catch (err) {
    next(err);
  }
}

/**
 * Deletes the book from the database returns deleted book
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object response (Book)
 */
const deleteBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  try {
    //authenticating & authorizing(role)
    const response = await requestAuthenticator(req);
    roleAuthorizer(response.role, ROLES.ADMIN);

    const deletedBook = await Book.findByIdAndDelete(bookId);
    if (!deletedBook) {
      res.status(404).json({ message: 'Invalid Book!' });
    }

    return res.status(200).json({ message: 'Book deleted successfully', book: deletedBook });
  }
  catch (err) {
    next(err);
  }
}

module.exports = {
  getBooks,
  createBook,
  updateBook,
  deleteBook
}