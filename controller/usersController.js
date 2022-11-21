const User = require('../model/Users');
const Post = require('../model/Posts');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const { sub } = require('date-fns')

//update user
exports.updateUserInfo = asyncHandler(async(req, res) => {
  const {userId} = req.params
  const userInfoUpdate = req.body
  if(!userId) return res.status(403).json('you are not authorised')

  const targetUser = await User.findById(userId).exec()
  if(!targetUser) return res.status(403).json('user not found')

  if(userInfoUpdate.password){
    //check if passwords conflicts
    const match = await bcrypt.compare(userInfoUpdate.password, tarfetUser.password)
    if(match) return res.status(409).json('same as old, choose a new password!')

    const hashPassword = await bcrypt.hash(userInfoUpdate.password, 10)
    await targetUser.updateOne({$set: {password: hashPassword}})
  }
  else if(userInfoUpdate.hobbies){
    const filteredHobbies = userInfoUpdate.hobbies.filter(hob => !targetUser.hobbies.includes(hob))

    await Promise.all(filteredHobbies.map(hobby => (
      targetUser.updateOne({$push: {hobbies: hobby}})
    )))
  }
  else{
    await targetUser.updateOne({$set: userInfoUpdate})
  }

  const dateTime = sub(new Date(), { minutes: 0}).toISOString();
  await targetUser.updateOne({$set: {edited: true}})
  await targetUser.updateOne({$set: {editDate: dateTime}})

  const user = await User.findById(targetUser._id).select('-password').exec()
  res.status(201).json(user)
})

//delete hobby
exports.deleteHobbies = asyncHandler(async(req, res) => {
  const {userId} = req.params
  const {hobbies} = req.body
  if(!userId || !Array.isArray(hobbies)) return res.status(400).json('all fields are required')

  const targetUser = await User.findById(userId).exec()
  if(!targetUser) return res.status(403).json('user not found')

  const filteredHobbies = hobbies.filter(hob => targetUser.hobbies.includes(hob))

  await Promise.all(filteredHobbies.map(hobby => (
    targetUser.updateOne({$pull: {hobbies: hobby}})
  )))

  const user = await User.findById(targetUser._id).select('-password').exec()
  res.status(201).json(user)
})

//add or remove admin role
exports.toggleAdminRole = asyncHandler(async(req, res) => {
  const {adminId, userId} = req.params
  if(!adminId || !userId) return res.status(403).json('admin ID required')

  //get admin user
  const adminUser = await User.findById(adminId).exec()
  if(!adminUser) return res.status(401).json('you are not authorised')
  const isAdmin = Object.values(adminUser?.roles).includes('ADMIN')
  if(!isAdmin) return res.status(401).json('unauthorised')
  else if(isAdmin){
    const user = await User.findById(userId).exec()
    if(!Object.values(user?.roles).includes('ADMIN')){
      const result = await user.updateOne({$push: {roles: 'ADMIN'}})
      result && res.status(201).json('admin role added')
    }
    else{
      const result = await user.updateOne({$pull: {roles: 'ADMIN'}})
      result && res.status(201).json('admin role removed')
    }
  }
})

//add or remove editor role
exports.toggleEditorRole = asyncHandler(async(req, res) => {
  const {adminId, userId} = req.params
  if(!adminId || !userId) return res.status(403).json('admin ID required')

  //get admin user
  const adminUser = await User.findById(adminId).exec()
  if(!adminUser) return res.status(401).json('you are not authorised')
  const isAdmin = Object.values(adminUser?.roles).includes('ADMIN')
  if(!isAdmin) return res.status(401).json('unauthorised')
  else if(isAdmin){
    const user = await User.findById(userId).exec()
    if(!Object.values(user?.roles).includes('EDITOR')){
      const result = await user.updateOne({$push: {roles: 'EDITOR'}})
      result && res.status(201).json('editor role added')
    }
    else{
      const result = await user.updateOne({$pull: {roles: 'EDITOR'}})
      result && res.status(201).json('editor role removed')
    }
  }
})

//delete user by currentUser or admin AND also delete user posts
exports.deleteAccount = asyncHandler(async(req, res) => {
    const {userId} = req.params
    if(!userId) return res.status(403).json('you are unauthorised')

    const targetUser = await User.findById(userId).exec()
    if(!targetUser) return res.status(403).json('user not found')

    const userPosts = await Post.find({userId: targetUser._id}).lean()

    userPosts?.length && await userPosts.deleteMany()
    const result = await targetUser.deleteOne()
    result && res.sendStatus(204)
})

exports.deleteAccountByAdmin = asyncHandler(async(req, res) => {
  const {adminId, userId} = req.query
  if(!adminId || !userId) return res.status(403).json('you are unauthorised')

  const targetUser = await User.findById(userId).exec()
  if(!targetUser) return res.status(403).json('user not found')

  const adminUser = await User.findById(adminId).exec()
  if(!adminUser) return res.status(401).json('you are unauthorised..')

  const userPosts = await Post.find({userId: targetUser._id}).lean()

  const isAdmin = Object.values(adminUser?.roles).includes('ADMIN')
  if(!isAdmin) return res.status(401).json('unauthorised')

  userPosts?.length && await userPosts.deleteMany()
  const result = await targetUser.deleteOne()
  result && res.sendStatus(204)
})

//get a user
exports.getUser = asyncHandler(async(req, res) => {
  const {userId} = req.params
  if(!userId) return res.status(403).json('you are not authorised')

  const targetUser = await User.findById(userId).select('-password').exec()
  if(!targetUser) return res.status(403).json('user not found')
  const { isAccountActive, isAccountLocked, registrationDate, verificationLink, resetPassword, refreshToken, ...rest } = targetUser._doc;
  res.status(200).json(rest)
})

//get all users
exports.getAllUsers = asyncHandler(async(req, res) => {
  const {userId} = req.query
  if(!userId) return res.status(403).json('you are not authorised')

  const targetUser = await User.findById(userId).exec()
  if(!targetUser) return res.status(403).json('user not found')
  
  const allUsers = await User.find().select('-password').lean()
  if(!allUsers?.length) return res.status(403).json('users not found')

  let users = []
  await allUsers.map(user => {
    const { isAccountActive, isAccountLocked, registrationDate, verificationLink, resetPassword, refreshToken, ...rest } = user;
    return users.push(rest)
  })
  
  res.status(200).json(users)
})

//follower user
exports.followUser = asyncHandler(async(req, res) => {
  const {followerId, followingId} = req.query
  if(!followerId || !followingId) return res.status(403).json('all fields are required')

  const followingUser = await User.findById(followerId).exec()
  const followedUser = await User.findById(followingId).exec()
  if(!followingUser || !followedUser) return res.status(403).json('user not found')

  if(!followingUser?.following.includes(followedUser._id)){
    await followingUser.updateOne({$push: {following: followedUser._id}})
    await followedUser.updateOne({$push: {followers: followingUser._id}})
    return res.status(201).json('user followed')
  }
  else return res.status(400).json('you already followed this user')
})

//unfollow user
exports.unfollowUser = asyncHandler(async(req, res) => {
  const {followerId, followingId} = req.query
  if(!followerId || !followingId) return res.status(403).json('all fields are required')

  const followingUser = await User.findById(followerId).exec()
  const followedUser = await User.findById(followingId).exec()
  if(!followingUser || !followedUser) return res.status(403).json('user not found')

  if(followingUser?.following.includes(followedUser._id)){
    await followingUser.updateOne({$pull: {following: followedUser._id}})
    await followedUser.updateOne({$pull: {followers: followingUser._id}})
    return res.status(201).json('user unfollowed')
  }
  else return res.status(400).json('you do not follow this user')
})

//get user friends
exports.userFriends = asyncHandler(async(req, res) => {
  const {userId} = req.params
  if(!userId) return res.status(403).json('you are not authorised')

  const targetUser = await User.findById(userId).select('-password').exec()
  if(!targetUser) return res.status(403).json('user not found')

  const friends = await Promise.all(targetUser?.following.map(friendId => {
    return User.findById(friendId).select('-password').lean()
  }))
  if(!friends?.length) return res.status(400).json('friend list empty')

  let friendList = []
  await friends.map(friend => {
    const { isAccountActive, isAccountLocked, registrationDate, verificationLink, resetPassword, refreshToken, ...rest } = friend
    friendList.push(rest)
  })
  res.status(200).json(friendList);
})

//lock and unlock an account by admin
exports.lockOrUnlockAccount = asyncHandler(async(req, res) => {
  const {adminId, userId} = req.params
  if(!adminId || !userId) return res.status(403).json('admin ID required')

  //get admin user
  const adminUser = await User.findById(adminId).exec()
  if(!adminUser) return res.status(401).json('you are not authorised')
  const isAdmin = Object.values(adminUser?.roles).includes('ADMIN')
  if(!isAdmin) return res.status(401).json('unauthorised')
  else if(isAdmin){
    const dateTime = sub(new Date(), { minutes: 0}).toISOString();
    const user = await User.findById(userId).exec()

    if(user.isAccountLocked){
      await user.updateOne({$set: {dateUnLocked: dateTime}})
      const result = await user.updateOne({$set: {isAccountLocked: false}})
      result && res.status(200).json('account unlocked')
    }
    else{
      await user.updateOne({$set: {dateLocked: dateTime}})
      const result = await user.updateOne({$set: {isAccountLocked: true}})
      result && res.status(201).json('account locked')
    }
  }
})

