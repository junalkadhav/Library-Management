const { body } = require('express-validator');
const { Router } = require('express');

const Auth = require('../controllers/auth');

const router = Router();

router.get('/authorize', Auth.authenticateToken, Auth.authorizeUser);

module.exports = router;