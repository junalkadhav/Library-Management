const dotEnv = require('dotenv').config();
const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const ROLES = require('../models/roles');
const Status = require('../models/status');
const UserController = require('../controllers/user');

const MONGO_DB_CONNECTION_URI =
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@library-management.8qpqy.mongodb.net/${process.env.MONGO_TEST_DATABASE}?retryWrites=true&w=majority`;

let user;

//Tests for user controller
describe('User Controller', function () {
  /**
   * This funtion runs only once, when the script starts
   * set up a another database for testing purpose and create a dummy user
   */
  before(function (done) {
    mongoose.connect(MONGO_DB_CONNECTION_URI)
      .then(result => {
        const user = new User({
          name: 'test test',
          email: 'test@test.com',
          password: 'tester',
          role: ROLES.USER
        })
        return user.save();
      })
      .then(currentUser => {
        user = currentUser;
        done();
      })
      .catch(done)
  })

  //Failing scenario tests
  describe('Negative tests', function () {

    /**
     * Test the login method
     */
    it('Should throw an error with code 500 if accessing the database fails', function (done) {
      sinon.stub(User, 'findOne');
      User.findOne.throws();

      const req = {
        body: {
          email: 'test@test.com',
          password: 'tester'
        }
      };

      UserController.login(req, {}, () => { })
        .then(result => {
          expect(result).to.be.an('error');
          expect(result).to.have.property('statusCode', 500);
          done();
        })
        .catch(done);

      User.findOne.restore();
    });

    /**
     * Test the getFavouriteBooks method
     */
    it('Should throw an error with code 404 if user is invalid, while fetching favourite books', function (done) {
      const req = {
        body: {
          userId: 'adbsd'
        }
      };

      UserController.getFavouriteBooks(req, {}, () => { })
        .then(result => {
          expect(result).to.be.an('error');
          expect(result).to.have.property('statusCode', 404);
          done();
        })
        .catch(done);
    });

    /**
     * Test the addFavouriteBook method
     */
    it('Should throw an error with code 404 if user is invalid, while adding a favourite book', function (done) {
      const req = {
        body: {
          userId: 'adbsd'
        }
      };

      UserController.addFavouriteBook(req, {}, () => { })
        .then(result => {
          expect(result).to.be.an('error');
          expect(result).to.have.property('statusCode', 404);
          done();
        })
        .catch(done);
    });

    /**
     * Test the removeFavouriteBook method
     */
    it('Should throw an error with code 404 if user is invalid, while removing a favourite book', function (done) {
      const req = {
        body: {
          userId: 'adbsd'
        }
      };

      UserController.removeFavouriteBook(req, {}, () => { })
        .then(result => {
          expect(result).to.be.an('error');
          expect(result).to.have.property('statusCode', 404);
          done();
        })
        .catch(done);
    });

    /**
     * Test the updateUserPermission method
     */
    it('Should throw an error with code 404 if user is invalid whose role/status are to be updated', function (done) {
      const req = {
        params: {
          id: 'adbsd'
        }
      };

      UserController.updateUserPermissions(req, {}, () => { })
        .then(result => {
          expect(result).to.be.an('error');
          expect(result).to.have.property('statusCode', 404);
          done();
        })
        .catch(done);
    });

    /**
     * Test the getUsers method
     */
    it('Should throw an error with code 404 while fetching a single user', function (done) {
      const req = {
        query: {
          id: 'adbsd'
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

      UserController.getUsers(req, res, () => { })
        .then(result => {
          expect(res.statusCode).to.be.equal(404);
          expect(res.message).to.be.equal('User not found');
          done();
        })
        .catch(done);
    });
  });


  /**
   * Clean up method
   * Common method to close db connection and delete the test user created at the beginning of test script object in testing database
   */
  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      })
      .catch(done);
  });
})

