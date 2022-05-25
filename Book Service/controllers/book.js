const Book = require('../models/book');

const getBooks = (req, res, next) => {
  const favouriteBookIds = req.query.favourites;
  if (favouriteBookIds) {
    favbooks = favouriteBookIds.split(',');
    return res.status(200).json({ favouriteBooks: favbooks });
  }
  res.status(200).json({ message: 'reached getBooks routes' });
}

//dont use this instead use single route i.e aboves
const getBook = (req, res, next) => {
  const bookId = req.params.bookId;
  res.status(200).json({ message: 'reached single book routes ' + bookId });
}

const createBook = async (req, res, next) => {
  const title = req.body.title;
  const isbn = req.body.isbn;
  const publicationYear = req.body.publicationYear;
  const authors = req.body.authors.split(",").map(author => author.trim());
  const genres = req.body.genres.split(",").map(genre => genre.trim());
  const awardsWon = req.body.awardsWon.split(",").map(award => award.trim());

  const book = new Book({
    title: title,
    isbn: isbn,
    publicationYear: publicationYear,
    authors: authors,
    genres: genres,
    awardsWon: awardsWon
  })

  const createdBook = await book.save();
  res.status(201).json({ message: 'created Book', book: createdBook });
}

const updateBook = (req, res, next) => {
  const bookId = req.params.bookId;
  res.status(200).json({ message: 'reached updateBook routes ' + bookId });
}

const deleteBook = (req, res, next) => {
  const bookId = req.params.bookId;
  res.status(200).json({ message: 'reached deleteBook routes ' + bookId });
}

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
}