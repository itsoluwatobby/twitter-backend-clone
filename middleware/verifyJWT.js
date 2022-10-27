const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken')

exports.accountVerificationJWT = asyncHandler(async(req, res, next) => {
   const {token} = req.query;
   if(!token) return res.status(401).json('unauthorized')
   jwt.verify(
      token,
      process.env.ACCOUNT_CONFIRMATION_TOKEN_SECRET,
      (error, decoded) => {
         if(error && Date.now() >= decoded?.exp * 1000) {
             return res.status(406).json('verification link expired, please login in to get a new confirmation link')
         }
         else if(error) return res.status(401).json('you are not authorized')
         req.firstName = decoded.userInfo.firstName
         req.email = decoded.userInfo.email
      }
   )
   next();
}) 

exports.passwordVerificationJWT = asyncHandler(async(req, res, next) => {
   const {token} = req.query;
   if(!token) return res.status(401).json('unauthorized')
   jwt.verify(
      token,
      process.env.PASSWORD_RESET_TOKEN_SECRET,
      (error, decoded) => {
         if(Date.now() >= decoded?.exp * 1000) next()
         else if(error) return res.status(401).json('you are not authorized')
         req.email = decoded.userInfo.email
         req.roles = decoded.userInfo.roles
      }
   )
   next();
}) 

exports.accessTokenVerificationJWT = asyncHandler(async(req, res, next) => {
   const auth = req.headers.authorization || req.headers.Authorization
   if(!auth || !auth?.startsWith('Bearer ')) return res.status(401).json('unauthorized')
   const token = auth.split(' ')[1]
  
   jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (error, decoded) => {
         if(Date.now() >= decoded?.exp * 1000) next()
         else if(error) return res.status(401).json('you are not authorized')
         req.email = decoded.userInfo.email
         req.roles = decoded.userInfo.roles
      }
   )
   next();
}) 

exports.refreshTokenVerificationJWT = asyncHandler(async(req, res, next) => {
   const cookies = req.cookies;
   if(!cookies?.jwt) return res.status(401).json('unauthorized')
   const token = cookies.jwt
   
   jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (error, decoded) => {
         if(error) return res.status(401).json('you are not authorized')
         req.email = decoded.userInfo.email
      }
   )
   next();
}) 



