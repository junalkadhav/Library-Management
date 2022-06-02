const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');

const authMiddleware = require('../middleware/auth');

describe('Auth Middleware', function () {

  /**
     * testing authenticateToken method should throw error if the header is missing 
     */
  it('Should throw an error if authorization header is missing', function (done) {

    const req = {
      get: function (headerName) {
        return null;
      }
    };
    authMiddleware.authenticateToken(req, {}, () => { })
      .then(result => {
        expect(result).to.be.an('error');
        expect(result).to.have.property('statusCode', 401);
        expect(result).to.have.property('message', 'Not authenticated.');
        done();
      })
      .catch(done)
  })

  /**
   * testing authenticateToken method, should throw error if request fails to get authenticated from user service
   */
  it('Should throw an error if the request fails to authenticate itself via user service', function (done) {
    const req = {
      get: function (headerName) {
        return 'some token';
      }
    };
    sinon.stub(axios, 'get');
    axios.get.throws();
    authMiddleware.authenticateToken(req, {}, () => { })
      .then(result => {
        expect(result).to.be.an('error');
        done();
      })
      .catch(done)
    axios.get.restore();
  });

});