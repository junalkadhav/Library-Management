const { body } = require('express-validator');
const { Router } = require('express');

const bookController = require('../controllers/book');
const auth = require('../middleware/auth');
const ROLES = require('../models/roles');

const router = Router();

//array of validation methods for book fields (title,author...etc)
const validateBookFields = [
  body('title', 'Title should contain only alphabets & numbers (characters:[min:3,max:60])')
    .trim()
    .isAlphanumeric('en-US', { ignore: ' ' })
    .isLength({ min: 3, max: 60 }),
  body('isbn')
    .trim()
    .isString()
    .notEmpty(),
  body('publicationYear', 'Enter a valid year')
    .isInt({ gt: 999, lt: (new Date().getFullYear() + 1) }),
  body('authors', 'Atleast one author should be mentioned (required format: [ author1, author2 ])')
    .isArray({ min: 1 }),
  body('genres', 'Atleast one author should be mentioned (required format: [ genre1, genre2 ])')
    .isArray({ min: 1 }),
  body('awardsWon', 'required format: [ award1, award2 ]')
    .isArray()
]

//#region Routes

//route to fetch book(s)
//*Accessible to USER & ADMIN only
//To fetch particular book(s) append query parameter with id ex.> /book/get-books?id=bookId(s), for multiple id's enter ',' to differentiate
//GET /book/get-books
router.get('/get-books', auth.authenticateToken, auth.authorizeUserRole(ROLES.ADMIN, ROLES.USER), bookController.getBooks);

//route to create a book
//*Accessible to ADMIN only
//POST /book/create-book
router.post('/create-book', auth.authenticateToken, auth.authorizeUserRole(ROLES.ADMIN), validateBookFields, bookController.createBook);

//route to update existing book using book id
//*Accessible to ADMIN only
//PUT /book/update-book/bookId
router.put('/update-book/:bookId', auth.authenticateToken, auth.authorizeUserRole(ROLES.ADMIN), validateBookFields, bookController.updateBook);

//route to delete a book using book id
//*Accessible to ADMIN only
//DELETE /book/delete-book/bookId
router.delete('/delete-book/:bookId', auth.authenticateToken, auth.authorizeUserRole(ROLES.ADMIN), bookController.deleteBook);

//#endregion

module.exports = router;
