const dotEnv = require('dotenv').config();
const expect = require('chai').expect;
const sinon = require('sinon');

const bookController = require('../controllers/book');
const Book = require('../models/book');

//Tests for Book controller
describe('Book Controller', function () {


  /**
  * test the getBooks method if database operation fails
  */
  // it('Should throw an error with code 500 if accessing database fails while fetching', function (done) {

  //   //test with id and search
  //   const req = {
  //     query: {
  //       id: '62906aed61257019105635a2'
  //     }
  //   }
  //   const res = {
  //     statusCode: 500,
  //     status: function (code) {
  //       this.statusCode = code;
  //       return this;
  //     },
  //     json: function (data) {
  //       this.message = data.message;
  //     }
  //   };
  //   sinon.stub(Book, 'find');
  //   Book.find.throws();

  //   bookController.getBooks(req, res, () => { })
  //     .then(result => {
  //       expect(result).to.be.an('error');
  //       expect(result).to.have.property('statusCode', 500);
  //       expect(result).to.have.property('message', 'Something went wrong, try again later :(');
  //       done();
  //     })
  //     .catch(done);

  //   Book.find.restore();
  // });

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
  // it.only('Should throw an error with code 500 if accessing database fails', function (done) {

  //   const req = {
  //     params: {
  //       bookId: '62906aed61257019105635a2'
  //     }
  //   }
  //   const res = {
  //     statusCode: 500,
  //     status: function (code) {
  //       this.statusCode = code;
  //       return this;
  //     },
  //     json: function (data) {
  //       this.message = data.message;
  //     }
  //   };
  //   sinon.stub(Book, 'findByIdAndDelete');
  //   Book.findByIdAndDelete.throws();

  //   bookController.deleteBook(req, res, () => { })
  //     .then(result => {
  //       console.log(result)
  //       expect(result).to.be.an('error');
  //       expect(result).to.have.property('statusCode', 500);
  //       expect(result).to.have.property('message', 'Something went wrong, try again later :(');
  //       done();
  //     })
  //     .catch(done);

  //   Book.findByIdAndDelete.restore();
  // });

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


})
