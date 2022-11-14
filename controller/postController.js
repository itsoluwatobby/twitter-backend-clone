const User = require('../model/User');
const Post = require('../model/Posts');
const SharedPost = require('../model/SharedPosts');
const asyncHandler = require('express-async-handler');
const { sub } = require('date-fns');
const SharedPosts = require('../model/SharedPosts');

//create a post
exports.createPosts = asyncHandler(async(req, res) => {
  const newPost = req.body
  if(!newPost?.userId || !newPost?.title || !newPost.body || !newPost?.postDate) return res.status(400).json('all fields are required')

  const user = await User.findById(newPost.userId).exec()
  if(!user) return res.status(403).json('user not found')
  const post = await Post.create(newPost)

  post && res.status(201).json('post created')
})

//update post
exports.updatePost = asyncHandler(async(req, res) => {
  const {postId} = req.params
  const editPost = req.body
  if(!editPost?.userId || !postId) return res.status(400).json('all fields are required')

  const user = await User.findById(editPost.userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const userPost = await Post.findById(postId).exec()
  if(!userPost) return res.status(400).json('you do not have a post')
  
  if(userPost?.userId !== user?._id) return res.sendStatus(401)
  const post = await userPost.updateOne({$set: editPost})

  post && res.status(201).json(post)
})

//delete post by user
exports.deletePosts = asyncHandler(async(req, res) => {
  const {userId, postId} = req.params
  if(!userId || !postId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const userPost = await Post.findById(postId).exec()
  if(!userPost) return res.status(400).json('you do not have a post')

  if(userPost?.userId !== user?._id) return res.sendStatus(401)
  await userPost.deleteOne()
  res.status(204).json('post deleted')
})

//delete post by admin
exports.deletePostByAdmin = asyncHandler(async(req, res) => {
  const {adminId, postId} = req.params
  if(!adminId || !postId) return res.status(400).json('all fields are required')

  const user = await User.findById(adminId).exec()
  if(!user) return res.status(403).json('user not found') 
  if(!Object.values(user?.roles).includes('ADMIN')) return res.status(401).json('you are not authorised')

  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('post not found')

  await post.deleteOne()
  res.status(204).json('post deleted')
})

//delete all user post by admin
exports.deleteUsersPostsByAdmin = asyncHandler(async(req, res) => {
  const {adminId, userId} = req.query
  if(!adminId || !userId) return res.status(400).json('all fields are required')

  const user = await User.findById(adminId).exec()
  if(!user) return res.status(403).json('user not found') 
  if(!Object.values(user?.roles).includes('ADMIN')) return res.status(401).json('you are not authorised')

  const posts = await Post.find({userId}).lean()
  if(!posts?.length) return res.status(400).json('user does not have a post')

  await posts.deleteMany()
  res.status(204).json('user posts deleted')
})

//get a post
exports.getPost = asyncHandler(async(req, res) => {
  const {postId} = req.params
  if(!postId) return res.status(400).json('all fields are required')

  // const user = await User.findById(userId).exec()
  // if(!user) return res.status(403).json('user not found') 
  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('post not found')
  res.status(200).json(post)
})

//get user's posts
exports.getUserPosts = asyncHandler(async(req, res) => {
  const {userId} = req.params
  if(!userId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const posts = await Post.find({userId: user._id}).lean()
  if(!posts?.length) return res.status(400).json('posts not found')
  res.status(200).json(posts)
})

//get all posts
exports.getAllPosts = asyncHandler(async(req, res) => {
  const {userId} = req.params
  if(!userId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const posts = await Post.find().lean()
  if(!posts?.length) return res.status(400).json('posts not found')
  res.status(200).json(posts)
})

//like and unlike a post
exports.likeAndUnlikePosts = asyncHandler(async(req, res) => {
  const {userId, postId} = req.params
  if(!userId || !postId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('posts not found')

  if(!Object.values(post?.likes).includes(userId)){
    await post.updateOne({$push: {likes: userId}})
    return res.status(201).json('you liked this post')
  }
  else{
    await post.updateOne({$pull: {likes: userId}})
    return res.status(201).json('you unliked this post')
  }
})

//like and unlike a post
exports.dislikeAndUnDislikePosts = asyncHandler(async(req, res) => {
  const {userId, postId} = req.params
  if(!userId || !postId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('posts not found')

  if(!Object.values(post?.disLikes).includes(userId)){
    await post.updateOne({$push: {disLikes: userId}})
    return res.status(201).json('you disliked this post')
  }
  else{
    await post.updateOne({$pull: {disLikes: userId}})
    return res.status(201).json('you unDisliked this post')
  }
})

//share a post
exports.sharePost = asyncHandler(async(req, res) => {
  const {sharerId, userId, postId} = req.params
  if(!sharerId || !userId || !postId) return res.status(400).json('all fields are required')

  //user post
  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('posts not found')

  if(!Object.values(post?.isShared).includes(sharerId)){
    await post.updateOne({$push: {isShared: sharerId}})
    
    const sharedDate = sub(new Date(), { minutes: 0}).toISOString();
    const share = await SharedPosts.create({
      sharerId, sharedDate, sharedPost: post
    })
    res.status(201).json(share)
  }
  else{
    await post.updateOne({$pull: {isShared: sharerId}})
    const sharedPost = await SharedPosts.findOne({sharedPost: {_id: post._id}})
    await sharedPost.deleteOne()
    res.status(204).json('you unShared this post')
  }
})
