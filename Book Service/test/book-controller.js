const dotEnv = require('dotenv').config();
const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const bookController = require('../controllers/book');
const Book = require('../models/book');

const MONGO_DB_CONNECTION_URI =
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@library-management.8qpqy.mongodb.net/${process.env.MONGO_TEST_DATABASE}?retryWrites=true&w=majority`;

//varible to store dummy book to use it for testing
let golbalBook;

//Tests for Book controller
describe('Book Controller', function () {

  /**
   * This funtion runs only once, when the script starts
   * this method set's up a another database for testing purpose and create a dummy book
   */
  before(function (done) {
    mongoose.connect(MONGO_DB_CONNECTION_URI)
      .then(result => {
        const book = new Book(
          {
            title: "Dummy",
            isbn: "9780439785969",
            publicationYear: "2000",
            authors: [""],
            genres: ["some genre"],
            awardsWon: ["new award"]
          }
        )
        return book.save();
      })
      .then(book => {
        globalBook = book;
        done();
      })
      .catch(done)
  });

  /**
   * test createBook method to check success response after successfully creating and saving a book
   */
  it('Should return code 201 after successfully creating a book', function (done) {
    const req = {
      body: {
        title: "Dummy",
        isbn: "9780439785969",
        publicationYear: "2000",
        authors: [""],
        genres: ["some genre"],
        awardsWon: ["new award"]
      }
    };
    const res = {
      statusCode: 500,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      }
    };
    bookController.createBook(req, res, () => { })
      .then(() => {
        expect(res.statusCode).to.be.equal(201);
        expect(res.message).to.be.equal('Book created successfully!');
        done();
      }).catch(done)
  });

  /**
   * test getBooks method to check success response after successfully fetching all books
   */
  it('Should return code 200 after fetching all books', function (done) {
    const req = {
      query: {}
    }
    const res = {
      statusCode: 500,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      }
    };
    bookController.getBooks(req, res, () => { })
      .then(() => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.message).to.be.equal('Fetched books successfully!');
        done();
      }).catch(done)
  });

  /**
   * test updateBook method to check success response after successfully fetching all books
   */
  it('Should return code 200 after successfully updating the book', function () {
    const req = {
      params: {
        bookId: globalBook._id
      },
      body: {
        title: "updated book",
        isbn: "1234567890123",
        publicationYear: "1999",
        authors: ["new author"],
        genres: ["some genre"],
        awardsWon: ["new award"]
      }
    };
    const res = {
      statusCode: 500,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      }
    };
    bookController.updateBook(req, res, () => { })
      .then(() => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.message).to.be.equal('Book updated successfully!');
      })
  });

  /**
   * test to check deleteBook method after successfully deleting the book
   */
  it('Should return code 200 after successfully deleting the book', function () {
    const req = {
      params: {
        bookId: globalBook._id
      }
    };
    const res = {
      statusCode: 500,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      }
    };
    bookController.deleteBook(req, res, () => { })
      .then(() => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.message).to.be.equal('Book deleted successfully!');
      })
  });

  /**
   * test the getBooks method if invalid book id is passed
   */
  it('Should throw an error with code 404 if book id is invalid while fetching', function (done) {
    const req = {
      query: {
        id: 'asd'
      }
    }
    const res = {
      statusCode: 500,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      }
    };
    bookController.getBooks(req, res, () => { })
      .then(result => {
        expect(result).to.be.an('error');
        expect(result).to.have.property('statusCode', 404);
        expect(result).to.have.property('message', 'Invalid Book');
        done();
      })
      .catch(done);
  });

  /**
  * test the getBooks method if database operation fails
  */
  it('Should throw an error with code 500 if accessing database fails while fetching', function (done) {

    const req = {
      query: {
        id: '62906aed61257019105635a2'
      }
    }
    const res = {
      statusCode: 500,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      }
    };
    sinon.stub(Book, 'find');
    Book.find.throws();

    bookController.getBooks(req, res, () => { })
      .then(result => {
        expect(result).to.be.an('error');
        expect(result).to.have.property('statusCode', 500);
        expect(result).to.have.property('message', 'Something went wrong, try again later :(');
        done();
      })
      .catch(done);

    Book.find.restore();
  });

  /**
   * test updateBook method if book is invalid
   */
  it('Should throw an error with code 404 while trying to update invalid book', function (done) {
    const req = {
      params: {
        bookId: 'abc'
      }
    }
    const res = {
      statusCode: 500,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      }
    };

    bookController.updateBook(req, res, () => { })
      .then(() => {
        expect(res.message).to.be.equal('Invalid Book!')
        expect(res.statusCode).to.be.equal(404);
        done();
      })
      .catch(done);
  })

  /**
   * test the deleteBook method if database operation fails
   */
  it('Should throw an error with code 500 if accessing database fails while deleting book', function (done) {

    const req = {
      params: {
        bookId: '62906aed61257019105635a2'
      }
    }
    sinon.stub(Book, 'findByIdAndDelete');
    Book.findByIdAndDelete.throws();

    bookController.deleteBook(req, {}, () => { })
      .then(result => {
        expect(result).to.be.an('error');
        expect(result).to.have.property('message', 'Something went wrong, try again later :(');
        expect(result).to.have.property('statusCode', 500);
        done();
      })
      .catch(done);

    Book.findByIdAndDelete.restore();
  });

  /**
   * testing deleteBook method if book is invalid
   */
  it('Should throw an error with code 404 while trying to remove invalid book or book that does not exist', function (done) {

    const req = {
      params: {
        bookId: 'abc'
      }
    }
    const res = {
      statusCode: 500,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.message = data.message;
      }
    };

    bookController.deleteBook(req, res, () => { })
      .then(() => {
        expect(res.message).to.be.equal('Invalid Book!')
        expect(res.statusCode).to.be.equal(404);
        done();
      })
      .catch(done);
  });

  /**
   * Clean up method
   * Common method to close db connection and delete the dummy book created at the beginning of test script from testing database
   */
  after(function (done) {
    Book.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      })
      .catch(done);
  });

})
