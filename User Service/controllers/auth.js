const jwt = require('jsonwebtoken');

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
  console.log('token valid')
  req.userId = decodedToken.userId;
  req.role = decodedToken.role;
  next();
};

//function to authorize user from different micro service
const authorizeUser = (req, res, next) => {
  res.json({ success: true, userId: req.userId, role: req.role })
}

const authRole = (role) => {
  return (req, res, next) => {
    if (req.role !== role) {
      res.status(401)
      return res.send('Not authorized')
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeUser,
  authRole
};
