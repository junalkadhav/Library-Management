const { body } = require('express-validator');
const { Router } = require('express');

const bookController = require('../controllers/book');

const router = Router();

//validation methods for book fields
const validateBook = [
  body('title', 'Title should contain only alphabets (characters:[min:3,max:60])')
    .trim()
    .isAlpha('en-US', { ignore: ' ' })
    .isLength({ min: 3, max: 60 }),
  body('isbn')
    .trim()
    .isString()
    .notEmpty(),
  body('publicationYear', 'Enter a valid Year')
    .isNumeric()
    .isLength({ min: 4, max: 4 }),
  body('authors', 'Atleast one author should be mentioned (required format: [ author1, author2 ])')
    .isArray({ min: 1 }),
  body('genres', 'Atleast one author should be mentioned (required format: [ genre1, genre2 ])')
    .isArray({ min: 1 }),
  body('awardsWon', 'required format: [ award1, award2 ]')
    .isArray()
]

//route to fetch book(s)
//GET /book/get-books
router.get('/get-books', bookController.getBooks);

//route to create a book
//POST /book/create-book
router.post('/create-book', validateBook, bookController.createBook);

//route to update existing book using book id
//PUT /book/update-book/bookId
router.put('/update-book/:bookId', validateBook, bookController.updateBook);

//route to delete a book using book id
//DELETE /book/delete-book/bookId
router.delete('/delete-book/:bookId', bookController.deleteBook);

module.exports = router;
