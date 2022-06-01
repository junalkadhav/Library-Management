const axios = require('axios');

/**
 * Authenticates the request via calling the user micro service
 * If request is valid then is forwarded to next middleware, else throws error
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    try {
      const response = await axios.get(process.env.USER_SERVICE_URL + "/authorize", {
        headers: {
          Authorization: authHeader
        }
      })
      req.role = response.data.role;
      req.userId = response.data.userId;
      next();
    }
    catch (err) {
      //if axios serivce call fails then erorr data is inside err.response object extracting that data
      if (err.response) {
        err.statusCode = err.response.status;
        if (err.response.data.message) {
          err.message = err.response.data.message
        } else {
          err.message = err.response.statusText;
        }
      }
      throw (err);
    }
  }
  catch (err) {
    next(err);
    return err;
  }
}

/**
 * Function Description:
 * This function returns middleware function which is to be executed when this method is called
 * This middleware function then compares the role from incoming request and roles passed
 * Atleast one role should match, else throws error
 * @param {string} role 
 * @returns {Function} - middleware function
 */
const authorizeUserRole = (...allowedRoles) => {
  return (req, res, next) => {
    for (let i = 0; i < allowedRoles.length; i++) {
      if (allowedRoles[i].toString() === req.role.toString()) {
        return next();
      }
    }
    const error = new Error('Not authorized.');
    error.statusCode = 403;
    throw error;
  }
}

module.exports = {
  authenticateToken,
  authorizeUserRole
}
