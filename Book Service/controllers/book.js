const { validationResult } = require('express-validator');

const Book = require('../models/book');

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
    const booksPerPage = 2; //total no of books per page to be displayed

    //id represents book id(s) [seperated with comma "," if multiple] is of type string
    let id;
    if (req.query.id) {
      id = req.query.id.trim().split(','); //converting id(s) to array to pass it to "Book.find(..)" method for querying
    }
    //search represents search parameter from request query parameter is of type string
    if (req.query.search) {
      req.query.search = req.query.search.trim();
    }

    //if "search" exist in request body then this if-else-if block will be executed 
    const search = req.query.search;
    if (search) {
      try {
        //count total books matching search criteria
        const totalBooks = await Book.find({ $or: [{ title: search }, { isbn: search }, { publicationYear: search }, { authors: search }, { awardsWon: search }, { genres: search }] }).countDocuments();
        //passing search query to find appropriate books in particular fields
        const queryedBooks = await Book
          .find({
            $or: [
              { title: search },
              { isbn: search },
              { publicationYear: search },
              { authors: search },
              { awardsWon: search },
              { genres: search }
            ]
          })
          //code to fetch data according to the pagination logic
          .skip((currentPage - 1) * booksPerPage)
          .limit(booksPerPage);
        return res.status(200).json({ message: 'Searched books successfully!', totalResultsFound: totalBooks, books: queryedBooks });
      }
      catch (err) {
        console.log(err);
        const error = new Error('Sorry, could not find anything, try searching something else!');
        error.statusCode = 404;
        throw error;
      }
    } else if (search === "") { //if search is empty instead of fetching all books as search will be undefined return no results
      return res.status(200).json({ message: 'Searched books successfully!', totalResultsFound: 0, books: [] });
    }

    //if id(s) exist then fetch those particular books
    if (id) {
      try {
        //count total no of books depending on the valid id(s)
        const totalBooks = await Book.find({ _id: id }).countDocuments();
        //passing array of id(s) to fetch book(s)
        const queryedBooks = await Book.find({ _id: id })
          //code to fetch data according to the pagination logic
          .skip((currentPage - 1) * booksPerPage)
          .limit(booksPerPage);
        return res.status(200).json({ message: 'Queryed books successfully!', totalBooks: totalBooks, books: queryedBooks });
      }
      catch (err) {
        const error = new Error('Invalid Book'); //if atleast one id is invalid 
        error.statusCode = 404;
        throw error;
      }
    }
    //if no query paramerters passed fetch all books
    const totalBooks = await Book.find().countDocuments();
    const books = await Book.find().skip((currentPage - 1) * booksPerPage).limit(booksPerPage);
    return res.status(200).json({ message: 'Fetched books successfully!', totalBooks: totalBooks, books: books }); //return success response
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
    const createdBook = await book.save();
    return res.status(201).json({ message: 'Book created successfully!', book: createdBook });
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

    validateBookFields(req); //validating book fields (title,isbn,.....etc)

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
    return res.status(200).json({ message: 'Book updated successfully!', book: updatedBook });
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

    const deletedBook = await Book.findByIdAndDelete(bookId);
    if (!deletedBook) {
      return res.status(404).json({ message: 'Invalid Book!' });
    }
    return res.status(200).json({ message: 'Book deleted successfully!', book: deletedBook });
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