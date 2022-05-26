const { Router } = require('express');

const bookController = require('../controllers/book');

const router = Router();

router.get('/get-books', bookController.getBooks);

router.post('/create-book', bookController.createBook);

router.put('/update-book/:bookId', bookController.updateBook);

router.delete('/delete-book/:bookId', bookController.deleteBook);

module.exports = router;