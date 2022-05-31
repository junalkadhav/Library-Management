const dotEnv = require('dotenv').config();
const expect = require('chai').expect;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authController = require('../controllers/auth');


//Tests for auth controller
describe('Auth Controller', function () {

  /**
   * testing authenticateToken method should throw error if the header is missing 
   */
  it('Should throw an error if authorization header is missing', function () {

    const req = {
      get: function (headerName) {
        return null;
      }
    };
    expect(() => { authController.authenticateToken(req, {}, () => { }) }).to.throw('Not authenticated.');
  })

  /**
   * testing authenticateToken method, should throw error if the header is invalid (only one string)
   */
  it('should throw an error if the authorization header is only one string', function () {
    const req = {
      get: function (headerName) {
        return 'xyz';
      }
    };
    expect(() => { authController.authenticateToken(req, {}, () => { }) }).to.throw();
  });

  /**
   * testing authenticateToken method, should throw error if the token is invalid
   */
  it('Should throw an error if the token cannot be verified', function () {

    const req = {
      get: function (headerName) {
        return 'Bearer xyz';
      }
    };
    expect(() => { authController.authenticateToken(req, {}, () => { }) }).to.throw();
  })

  /**
   * testing authenticateToken method, should return role and userId after successfully decoding the token
   */
  it('should yield a userId and role after decoding the token', function () {
    const req = {
      get: function (headerName) {
        return 'Bearer djfkalsdjfaslfjdlas';
      }
    };
    sinon.stub(jwt, 'verify');
    jwt.verify.returns({ userId: 'abc', role: 'dummy' });
    authController.authenticateToken(req, {}, () => { });
    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'abc');
    expect(req).to.have.property('role');
    expect(req).to.have.property('role', 'dummy');
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });
});