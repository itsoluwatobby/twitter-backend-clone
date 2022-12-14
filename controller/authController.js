const jwt = require('jsonwebtoken');
const User = require('../model/Users');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const { sub } = require('date-fns')

let transporter = nodemailer.createTransport({
   service: 'gmail',
   smtp: 'smtp.gmail.com',
   secure: false,
   auth:{
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.PASSWORD
   }
})

exports.registerHandler = asyncHandler( async(req, res) => {
   const { firstName, lastName, email, password } = req.body
   if(!firstName || !lastName || !email || !password){
      return res.status(400).json('all fields are required');
   }
   const duplicateEmail = await User.findOne({email}).exec();
   if(duplicateEmail) return res.status(409).json('email address already taken');

   const hashPassword = await bcrypt.hash(password, 10);

   const token = await jwt.sign(
      {
         userInfo:{ firstName, email }
      },
      process.env.ACCOUNT_CONFIRMATION_TOKEN_SECRET,
      {expiresIn: '25m'}
   )

   const verificationLink = `${process.env.ROUTE_LINK}/users/account_confirmation?token=${token}`

   const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: `ACCOUNT CONFIRMATION FOR ${firstName} ${lastName}`,
      html: `<h2>Please Tap the Link below To Confirm Your Account</h2><br/>
            <p>Link expires in 25 minutes, please confirm now</p>
            <a href=${verificationLink} target=_blank style='text-decoration:none;'>
               <button style='padding:1rem;   padding-left:2rem; padding-right:2rem; cursor:pointer; background-color: teal; border:none; border-radius:10px; font-size: 18px'>
                  Account Verification
               </button>
            </a>
            <p>Or copy the link below to your browser</p>
            <p>${verificationLink}</p><br/>
            <span>Please keep link private, it contains some sensitive information about you.</span>
            `
   };
   //save data to db
   const dateTime = sub(new Date(), { minutes: 0}).toISOString();
   const saveUser = await User.create({ 
      firstName, lastName, email, 
      password: hashPassword, 
      verificationLink,
      registrationDate: dateTime
   });
    
   const result = await transporter.sendMail(mailOptions, (err, success) => {
      if(err) return res.status(400).json({message:'unable to send email', err})
      else res.status(200).json('verification link has been sent to your email for confirmation')
   });
})


exports.confirmationHandler = asyncHandler( async(req, res) => {
   //verify confirmation link
      //if(req.firstName || req.email){
   const getConfirmedUser = await User.findOne({email: req.email})
   if(!getConfirmedUser) return res.status(401).json('bad credentials')

   if(!getConfirmedUser.isAccountActive){
      await getConfirmedUser.updateOne({$set: {isAccountActive: true, verificationLink: ""}})
      .then(() => res.status(302).redirect(`${process.env.REDIRECT_LINK}/successful_verification?email=${req.email}`))
      .catch(() => res.sendStatus(500));
   }
   else res.status(303).redirect(`${process.env.REDIRECT_LINK}/successful_verification?email=${req.email}`)
})

exports.loginHandler = asyncHandler( async(req, res) => {
   const {email, password} = req.body
   if(!email || !password) return res.status(400).json('all fields are required')

   const getConfirmedUser = await User.findOne({email}).exec()
   if(!getConfirmedUser) return res.status(401).json('bad credentials')

   const matchPassword = await bcrypt.compare(password, getConfirmedUser.password);
   if(!matchPassword) return res.status(401).json('bad credentials')
   //check if user account is active
   if(!getConfirmedUser.isAccountActive){
      
      const token = await jwt.sign(
         {
            userInfo:{ 
               firstName: getConfirmedUser.firstName, 
               email: getConfirmedUser.email 
            }
         },
         process.env.ACCOUNT_CONFIRMATION_TOKEN_SECRET,
         {expiresIn: '25m'}
      )

      const verificationLink = `${process.env.ROUTE_LINK}/users/account_confirmation?token=${token}`

      const mailOptions = {
         from: process.env.EMAIL_ADDRESS,
         to: email,
         subject: `ACCOUNT CONFIRMATION FOR ${getConfirmedUser.firstName} ${getConfirmedUser.lastName}`,
         html: `<h3>Please Tap the Link below To Confirm Your Account</h3><br/>
               <p>Link expires in 25 minutes, please confirm now</p>
               <a href=${verificationLink} target=_blank style='text-decoration:none;'>
                  <button style='padding:1rem;   padding-left:2rem; padding-right:2rem; cursor:pointer; background-color: teal; border:none; border-radius:10px; font-size: 18px'>
                     Account Verification
                  </button>
               </a>
               <p>Or copy the link below to your browser</p>
               <p>${verificationLink}</p><br/>
               <span>Please keep link private, it contains some sensitive information about you.</span>
               `
      };
      await getConfirmedUser.updateOne({$set: {verificationLink}})
      const result = await transporter.sendMail(mailOptions, (err, success) => {
         if(err) return res.status(400).json('unable to send email')
         else res.status(200).json('verification link has been sent to your email for confirmation')
      });
   }
   else if(getConfirmedUser.isAccountLocked) return res.status(403).json('your account is locked')
   else{
      const roles = Object.values(getConfirmedUser.roles)
      
      const accessToken = await jwt.sign(
         {
            userInfo:{ 
               email: getConfirmedUser.email, 
               roles: roles
            }
         },
         process.env.ACCESS_TOKEN_SECRET,
         {expiresIn: '1h'}
      )

      const refreshToken = await jwt.sign(
         {
            userInfo:{ 
               email: getConfirmedUser.email, 
            }
         },
         process.env.REFRESH_TOKEN_SECRET,
         {expiresIn: '1d'}
      )

      await getConfirmedUser.updateOne({$set: {status: 'online', refreshToken, lastSeen: '', resetPassword: false}})
      
      const loggedInUser = await User.findOne({email}).exec()
      const { password, verificationLink, resetPassword, ...rest } = loggedInUser._doc;
         
      res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })//secure: true
      res.status(200).json({rest, accessToken});
   }
})

exports.logoutHandler = asyncHandler( async(req, res) => {
   const cookies = req.cookies
   if(!cookies?.jwt) return res.sendStatus(204)
   const refreshToken = cookies.jwt;
   //find user by refresh token
   const user = await User.findOne({refreshToken}).exec();
   if(!user) {
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });//secure: true
      return res.sendStatus(204)
   }
   const dateTime = sub(new Date(), { minutes: 0}).toISOString();
   await user.updateOne({$set: {status: 'offline', refreshToken: '', lastSeen: dateTime}})

   res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });//secure: true
   res.sendStatus(204)
})

exports.passwordResetHandler = asyncHandler( async(req, res) => {
   const { email } = req.body
   if(!email) return res.status(400).json('all fields are required');
   
   const user = await User.findOne({email}).exec();
   if(!user) return res.status(403).json('bad credentials');

   if(user?.isAccountLocked) return res.status(403).json('your account is locked')
   const roles = Object.values(user.roles)

   const token = await jwt.sign(
      {
         userInfo:{ 
            email: user.email, 
            roles: roles 
         }
      },
      process.env.PASSWORD_RESET_TOKEN_SECRET,
      {expiresIn: '20m'}
   )

   const resetLink = `${process.env.ROUTE_LINK}/users/password_reset_confirmation?token=${token}`

   const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: user.email,
      subject: `Password reset token for ${user.firstName} ${user.lastName}`,
      html: `<h3>Please Tap The Link Below To Reset Your Password</h3><br/>
            <p>Link expires in 20 minutes. Link can only used once</p>
            <a href=${resetLink} target=_blank style='text-decoration:none;'>
               <button style='padding:1rem; padding-left:2rem; padding-right:2rem; cursor:pointer; background-color: lightblue; border:none; border-radius:10px; font-size: 18px'>
                  Reset Password
               </button>
            </a>
            <p>Or copy the link below to your browser</p>
            <p>${resetLink}</p><br/>
            <span>Please keep link private, it contains some sensitive information about you.</span>
            `
   };
   //save data to db
   await user.updateOne({$set: {resetPassword: true}})
   const result = await transporter.sendMail(mailOptions, (err, success) => {
      if(err) return res.status(400).json('unable to send email')
      else res.status(200).json('password reset link has been sent to your email for confirmation')
   });
})

exports.passwordConfirmationLink = asyncHandler( async(req, res) => {
   res.status(302).redirect(`${process.env.REDIRECT_LINK}/new_password?email=${req.email}`)
})

exports.passwordResetConfirmation = asyncHandler( async(req, res) => {
   const {email, resetPass} = req.body
   
   if(!email) return res.status(401).json('unauthorized')
   if(!resetPass) return res.status(400).json('new password required')

   const userPasswordReset = await User.findOne({email}).exec()
   if(!userPasswordReset) return res.status(401).json('bad credentials')

   const samePassword = await bcrypt.compare(resetPass, userPasswordReset.password);
   if(samePassword) return res.status(409).json('same as old password')

   if(userPasswordReset.resetPassword){
      const hashPassword = await bcrypt.hash(resetPass, 10);

      await userPasswordReset.updateOne({$set: {password: hashPassword, resetPassword: false}})
      .then(() => res.status(200).json('password reset successful'))
      .catch(() => res.sendStatus(500));
   }
   else res.status(401).json('unauthorized')
})

//for expired access
exports.getNewAccessToken = asyncHandler( async(req, res) => {
   //findUser by email
   const user = await User.findOne({ email: req.email })
   if(!user) return res.status(403).json('bad credentials')

   const roles = Object.values(user.roles);

   const accessToken = await jwt.sign(
      {
         userInfo:{ 
            email: user.email, 
            roles: roles
         }
      },
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: '1h'}
   )

   const refreshToken = await jwt.sign(
      {
         userInfo:{ 
            email: user.email, 
         }
      },
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: '1d'}
   )

   await user.updateOne({$set: {refreshToken}})
      
   res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })//secure: true
   res.status(200).json(accessToken);
})
