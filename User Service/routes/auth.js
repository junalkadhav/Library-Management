const { body } = require('express-validator');
const { Router } = require('express');

const Auth = require('../controllers/auth');

const router = Router();

//route to get a request authenticated (other micro-service request)
//GET /user/authorize
router.get('/authorize', Auth.authenticateToken, Auth.authorizeUser);

module.exports = router;