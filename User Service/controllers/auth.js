const jwt = require('jsonwebtoken');

/**
 * Authenticates the request
 * If request is valid then is forwarded to next middleware, else throws error
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JSON_TOKEN_SECRET_KEY);
  }
  catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  req.role = decodedToken.role;
  next();
};

/**
 * Function Description:
 * This function is runs only for request's coming from other micro service's(ex.> Book service)
 * This method is used after the authenticateToken method so that if the incoming request is valid, 
 * it can sen a valid response with required data
 * @param {Request} req incoming request object
 * @param {Response} res outgoing response object
 * @param {Function} next function to make a call to next middleware
 * @returns json response object
 */
const authorizeUser = (req, res, next) => {
  return res.json({ success: true, userId: req.userId, role: req.role })
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
  authorizeUser,
  authorizeUserRole
};
