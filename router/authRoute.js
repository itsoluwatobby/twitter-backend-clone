const router = require('express').Router();
const { 
   registerHandler, loginHandler, 
   logoutHandler, confirmationHandler, 
   passwordConfirmationLink, passwordResetHandler, 
   passwordResetConfirmation, getNewAccessToken } = require('../controller/authController');

const { 
   accountVerificationJWT, 
   passwordVerificationJWT, 
   refreshTokenVerificationJWT } = require('../middleware/verifyJWT');

//registration and account confirmation route
router.post('/register', registerHandler)
router.get('/account_confirmation', accountVerificationJWT, confirmationHandler)

//login route
router.post('/login', loginHandler)

//get new access token
router.get('/get_accessToken', refreshTokenVerificationJWT, getNewAccessToken)

//logout route
router.get('/logout', logoutHandler)

//password reset and confirmation route
router.post('/reset_password', passwordResetHandler)
router.get('/password_reset_confirmation', passwordVerificationJWT, passwordConfirmationLink)
router.patch('/password_confirmation', passwordResetConfirmation)

module.exports = router;
