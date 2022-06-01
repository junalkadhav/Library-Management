const { validationResult } = require('express-validator');

const Book = require('../models/book');

/**
 * Checks if book fields are valid, else throws error
 * @param {Request} req - incoming request object
 */
const validateBookFields = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw getCustomError('Validation failed.', 422, errors.array());
  }
}

/**
 * Fetches the books, if query params present fetches those books else all books.
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json object (books[]) 
 */
const getBooks = async (req, res, next) => {
  try {
    //params for pagination
    const currentPage = req.query.page || 1; //current page value
    const booksPerPage = 4; //total no of books per page to be displayed

    //id represents book id(s) (seperated with comma "," if multiple)
    let ids = req.query.id ? req.query.id.trim() : '';
    let fetchById = false;
    //search represents search-parameter from incoming request
    let search = req.query.search ? req.query.search.trim() : '';
    let fetchBySearch = false;

    let fetchCondition = {}; //empty object which will be modified if request has id or search has valid query params

    if (ids) {
      ids = ids.split(','); //if multiple ids are present split them to set it as query for fetching
      ids.forEach(id => {   //validate the ids if atleast one id is invalid throw error
        if (!Book.validateObjectId(id)) {
          throw getCustomError('Invalid Book', 404);
        }
      });
      fetchCondition = { _id: ids };
      fetchById = true;
    }
    else if (search) {
      fetchCondition = {  //specify fields with which the search should be carried out 
        $or: [
          { title: { '$regex': search, $options: 'i' } },
          { isbn: { '$regex': search, $options: 'i' } },
          { publicationYear: { '$regex': search, $options: 'i' } },
          { authors: { '$regex': search, $options: 'i' } },
          { awardsWon: { '$regex': search, $options: 'i' } },
          { genres: { '$regex': search, $options: 'i' } }
        ]
      }
      fetchBySearch = true;
    }

    try {
      const totalBooks = await Book.find(fetchCondition).countDocuments();
      const books = await Book.find(fetchCondition).skip((currentPage - 1) * booksPerPage).limit(booksPerPage);
      return res.status(200).json({ message: 'Fetched books successfully!', totalBooks: totalBooks, books: books, fetchById: fetchById, fetchBySearch: fetchBySearch }); //return success response
    }
    catch (err) {
      throw getDatabaseError();
    }
  }
  catch (err) {
    return errorHandler(err, next);
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
    validateBookFields(req); //validating book fields (title,isbn,.....etc)

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
    try {
      const createdBook = await book.save();
      return res.status(201).json({ message: 'Book created successfully!', book: createdBook });
    }
    catch (err) {
      throw getDatabaseError();
    }
  }
  catch (err) {
    return errorHandler(err, next);
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
    validateBookFields(req); //validating book fields (title,isbn,.....etc)

    const book = Book.validateObjectId(bookId) ? await Book.findById(bookId) : '';
    if (!book) {
      return res.status(404).json({ message: 'Invalid Book!' });
    }

    book.title = req.body.title;
    book.isbn = req.body.isbn;
    book.publicationYear = req.body.publicationYear;
    book.authors = req.body.authors;
    book.genres = req.body.genres;
    book.awardsWon = req.body.awardsWon;

    try {
      const updatedBook = await book.save();
      return res.status(200).json({ message: 'Book updated successfully!', book: updatedBook });
    }
    catch (err) {
      throw getDatabaseError();
    }
  }
  catch (err) {
    return errorHandler(err, next);
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
    const deletedBook = Book.validateObjectId(bookId) ? await Book.findByIdAndDelete(bookId) : '';
    if (!deletedBook) {
      return res.status(404).json({ message: 'Invalid Book!' });
    }
    return res.status(200).json({ message: 'Book deleted successfully!' });
  }
  catch (err) {
    return errorHandler(getDatabaseError(), next);
  }
}

/**
 * this method returns error on call which has a error & statusCode defined for database related operations
 */
const getDatabaseError = () => {
  return getCustomError('Something went wrong, try again later :(', 500);
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
 * This method returns error on call with custom message and statusCode
 * @param {String} message - custom message
 * @param {Number} statusCode - custom status code
 * @param {Object} optionalErrorData - any extra info about the error
 */
const getCustomError = (message, statusCode, optionalErrorData) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (optionalErrorData) {
    error.data = optionalErrorData;
  }
  return error;
}

module.exports = {
  getBooks,
  createBook,
  updateBook,
  deleteBook
}