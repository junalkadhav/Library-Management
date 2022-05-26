const axios = require('axios');

const Book = require('../models/book');

const getBooks = async (req, res, next) => {
  const id = req.query.id.split('=').pop().trim();
  console.log(id);
  try {
    if (id) {
      ids = id.split(',').filter(id => {
        id = id.trim();
        if (id.toString() !== "") {
          return id;
        }
      });
      console.log(ids);
      const queryedBooks = await Book.find({ _id: ids });
      return res.status(200).json({ message: 'queryed books successfully', books: queryedBooks });
    }
    else {
      const books = await Book.find();
      res.status(200).json({ message: 'fetched books successfully', books: books });
    }
  }
  catch (err) {
    next(err);
  }
}

const createBook = async (req, res, next) => {
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
    res.status(201).json({ message: 'created Book successfully', book: createdBook });
  }
  catch (err) {
    next(err);
  }
}

const updateBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'inavalid book' });
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

const deleteBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  try {
    const deletedBook = await Book.findByIdAndDelete(bookId);


    if (deletedBook) {
      //removing the deleted book from the users favourite
      axios.post('http://localhost:3000/user/remove-favourite-book', {
        bookId: bookId
      })
      return res.status(200).json({ message: 'deleted book successfully ', book: deletedBook });
    }
    else {
      res.status(400).json({ message: 'could not delete the book, make sure it exists before deleting' });
    }
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