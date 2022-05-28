const { Router } = require('express');

const auth = require('../controllers/auth');

const router = Router();

//route to get a request authenticated (other micro-service request)
//*accessible to EVERY-ONE
//GET /user/authorize
router.get('/authorize', auth.authenticateToken, auth.authorizeUser);

module.exports = router;