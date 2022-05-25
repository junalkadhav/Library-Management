const getBooks = (req, res, next) => {
  res.status(200).json({ message: 'reached getBooks routes' });
}
const getBook = (req, res, next) => {
  const bookId = req.params.bookId;
  res.status(200).json({ message: 'reached single book routes ' + bookId });
}
const createBook = (req, res, next) => {
  res.status(200).json({ message: 'reached createBook routes' });
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