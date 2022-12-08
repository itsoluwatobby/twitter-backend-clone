const User = require('../model/Users');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

exports.accountVerificationJWT = asyncHandler(async(req, res, next) => {
   const {token} = req.query;
   if(!token) return res.status(403).json('bad credentials')
   jwt.verify(
      token,
      process.env.ACCOUNT_CONFIRMATION_TOKEN_SECRET,
      (error, decoded) => {
         if(error?.name === 'TokenExpiredError'){ 
            return res.status(403).json('verification link expired. Please log in to get a new confirmation link')
         }
         else if(error?.name === 'JsonWebTokenError') return res.status(401).json('you are unauthorized')
         req.firstName = decoded.userInfo.firstName
         req.email = decoded.userInfo.email
      }
   )
   next();
}) 

exports.passwordVerificationJWT = asyncHandler(async(req, res, next) => {
   const {token} = req.query;
   if(!token) return res.status(403).json('bad credentials')
   jwt.verify(
      token,
      process.env.PASSWORD_RESET_TOKEN_SECRET,
      (error, decoded) => {
         if(error?.name === 'TokenExpiredError') return res.status(403).json('password reset link expired')
         else if(error?.name === 'JsonWebTokenError') return res.status(401).json('you are unauthorized')
         req.email = decoded.userInfo.email
         req.roles = decoded.userInfo.roles
      }
   )
   next();
}) 

exports.accessTokenVerificationJWT = asyncHandler(async(req, res, next) => {
   const auth = req.headers.authorization || req.headers.Authorization
   if(!auth || !auth?.startsWith('Bearer ')) return res.status(403).json('bad credentials')
   const token = auth.split(' ')[1]
  
   jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (error, decoded) => {
         if(error?.name === 'TokenExpiredError') return res.status(403).json('Expired token')
         else if(error?.name === 'JsonWebTokenError') return res.status(401).json('you are unauthorized')
         req.email = decoded.userInfo?.email
         req.roles = decoded.userInfo?.roles
      }
   )
   next();
}) 

exports.refreshTokenVerificationJWT = asyncHandler(async(req, res, next) => {
   const cookies = req.cookies;
   if(!cookies?.jwt) return res.status(403).json('bad credentials')
   const token = cookies.jwt
   res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });//secure: true

   const matchingToken = await User.findOne({refreshToken: token}).exec()
   //check if refresh token has used previously
   if(!matchingToken) {
      jwt.verify(
         token,
         process.env.REFRESH_TOKEN_SECRET,
         async (error, decoded) => {
            if(error?.name === 'TokenExpiredError') return res.status(403).json('expired refresh token')
            if(error?.name === 'JsonWebTokenError') return res.status(401).json('you are unauthorized')
            const hackedUser = await User.findOne({email: decoded.email}).exec()
            await hackedUser.updateOne({refreshToken: ''}) 
         }
      )
      return res.status(403).json('bad credentials');
   }
   
   jwt.verify(
      matchingToken.refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, decoded) => {
         if(error?.name === 'TokenExpiredError') return res.status(403).json('expired refresh token')
         else if(error?.name === 'JsonWebTokenError') return res.status(401).json('you are unauthorized')
         req.email = decoded.userInfo?.email
      }
   )
   next();
}) 



