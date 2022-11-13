const User = require('../model/User');
const Post = require('../model/Post');
const asyncHandler = require('express-async-handler');
const { sub } = require('date-fns')

//update user
exports.updateUserInfo = asyncHandler(async(req, res) => {
  const {userId} = req.params
  const userInfoUpdate = req.body
  if(!userId) return res.status(403).json('you are not authorised')

  const targetUser = await User.findById(userId).exec()
  if(!targetUser) return res.status(403).json('user not found')

  if(userInfoUpdate.firstName || userInfoUpdate.lastName || userInfoUpdate.password || userInfoUpdate.profilePicture){
    await targetUser.updateOne({$set: {firstName: userInfoUpdate.firstName}})
    await targetUser.updateOne({$set: {lastName: userInfoUpdate.lastName}})
    await targetUser.updateOne({$set: {password: userInfoUpdate.password}})
    await targetUser.updateOne({$set: {profilePicture: userInfoUpdate.profilePicture}})
  }
  else if(userInfoUpdate.desc || userInfoUpdate.country || userInfoUpdate.city || userInfoUpdate.relationShip){
    await targetUser.updateOne({$set: {desc: userInfoUpdate.desc}})
    await targetUser.updateOne({$set: {country: userInfoUpdate.country}})
    await targetUser.updateOne({$set: {city: userInfoUpdate.city}})
    await targetUser.updateOne({$set: {relationShip: userInfoUpdate.relationShip}})
  }

  const user = await User.findById(targetUser._id).select('-password').exec()
  res.status(201).json(user)
})

//add or remove admin role
exports.addOrRemoveAminRole = asyncHandler(async(req, res) => {
  const {adminId, userId} = req.params
  if(!adminId) return res.status(403).json('admin ID required')

  //get admin user
  const adminUser = await User.findById(adminId).exec()
  if(!adminUser) return res.status(401).json('you are not authorised')
  const isAdmin = Object.values(adminUser?.roles).includes('ADMIN')
  if(!isAdmin) return res.status(401).json('unauthorised')
  else if(isAdmin){
    const user = await User.findById(userId).exec()
    if(!Object.values(user?.roles).includes('ADMIN')){
      const result = await user.updateOne({$push: {roles: 'ADMIN'}})
      result && res.status(201).json(result)
    }
    else{
      const result = await user.updateOne({$pull: {roles: 'ADMIN'}})
      result && res.status(201).json(result)
    }
  }
})

//add or remove editor role
exports.addOrRemoveEditorRole = asyncHandler(async(req, res) => {
  const {adminId, userId} = req.params
  if(!adminId) return res.status(403).json('admin ID required')

  //get admin user
  const adminUser = await User.findById(adminId).exec()
  if(!adminUser) return res.status(401).json('you are not authorised')
  const isAdmin = Object.values(adminUser?.roles).includes('ADMIN')
  if(!isAdmin) return res.status(401).json('unauthorised')
  else if(isAdmin){
    const user = await User.findById(userId).exec()
    if(!Object.values(user?.roles).includes('EDITOR')){
      const result = await user.updateOne({$push: {roles: 'EDITOR'}})
      result && res.status(201).json(result)
    }
    else{
      const result = await user.updateOne({$pull: {roles: 'EDITOR'}})
      result && res.status(201).json(result)
    }
  }
})

//delete user by currentUser or admin
exports.deleteAccount = asyncHandler(async(req, res) => {
  const {userId} = req.params
  const {adminId, targetId} = req.query
  if(!userId) return res.status(403).json('you are not authorised')

  const targetUser = await User.findById(userId).exec()
  if(!targetUser) return res.status(403).json('user not found')
  
  const adminUser = await User.findById(adminId).exec()
  if(!adminUser) return res.status(401).json('you are not authorised')
  const target = await User.findById(targetId).exec()

  const isAdmin = Object.values(adminUser?.roles).includes('ADMIN')
  if(!isAdmin) return res.status(401).json('unauthorised')

  if(userId){
    const result = await targetUser.deleteOne()
    result && res.sendStatus(204)
  }
  else if(isAdmin){
    const result = await target.deleteOne()
    result && res.sendStatus(204)
  }
})

//get a user
exports.getUser = asyncHandler(async(req, res) => {
  const {userId} = req.params
  if(!userId) return res.status(403).json('you are not authorised')

  const targetUser = await User.findById(userId).select('-password').exec()
  if(!targetUser) return res.status(403).json('user not found')
  res.status(200).json(targetUser)
})

//get all users
exports.getAllUsers = asyncHandler(async(req, res) => {
  const {userId} = req.params
  if(!userId) return res.status(403).json('you are not authorised')

  const targetUser = await User.findById(userId).select('-password').exec()
  if(!targetUser) return res.status(403).json('user not found')
  
  const allUsers = await User.find().select('-password').lean()
  if(!allUsers?.length) return res.status(403).json('users not found')

  res.status(200).json(allUsers)
})

//follower user
exports.followUser = asyncHandler(async(req, res) => {
  
})

//unfollow user
exports.unfollowUser = asyncHandler(async(req, res) => {
  
})

//get user friends
exports.userFriends = asyncHandler(async(req, res) => {
  
})

