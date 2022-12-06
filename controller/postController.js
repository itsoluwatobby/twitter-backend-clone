const User = require('../model/Users');
const Post = require('../model/Posts');
const SharedPosts = require('../model/SharedPosts');
const asyncHandler = require('express-async-handler');
const { sub } = require('date-fns');

//create a post
exports.createPosts = asyncHandler(async(req, res) => {
  const newPost = req.body
  if(!newPost?.userId || !newPost?.title || !newPost.body || !newPost?.postDate) return res.status(400).json('all fields are required')

  const user = await User.findById(newPost.userId).exec()
  if(!user) return res.status(403).json('user not found')
  const post = await Post.create(newPost)

  post && res.status(201).json(post)
})

//update post
exports.updatePost = asyncHandler(async(req, res) => {
  const {postId} = req.params
  const editPost = req.body
  if(!editPost?.userId || !postId) return res.status(400).json('all fields are required')

  const user = await User.findOne({_id: editPost.userId}).exec()
  if(!user) return res.status(403).json('user not found') 

  const userPost = await Post.findById(postId).exec()
  if(!userPost) return res.status(400).json('you do not have a post')

  const dateTime = sub(new Date(), { minutes: 0 }).toISOString();
  
  if(!userPost?.userId.equals(user._id)) return res.sendStatus(401)
  await userPost.updateOne({$set: editPost})
  await userPost.updateOne({$set: {edited: true, editDate: dateTime}})
  const post = await Post.findById(postId).exec()

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

  if(!userPost?.userId.equals(user._id)) return res.sendStatus(401)
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

  const post = await Post.find({userId}).exec()
  if(!post?.length) return res.status(400).json('user does not have a post')

  await Post.deleteMany({userId})
        .then(() => res.status(204).json('user posts deleted'))
        .catch(error => res.status(400).json('error deleting posts'))
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
    await post.updateOne({$pull: {disLikes: userId}})
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
    await post.updateOne({$pull: {likes: userId}})
    return res.status(201).json('you disliked this post')
  }
  else{
    await post.updateOne({$pull: {disLikes: userId}})
    return res.status(201).json('you unDisliked this post')
  }
})

//share a post
exports.sharePost = asyncHandler(async(req, res) => {
  const {sharerId, ownerId, postId} = req.query
  if(!sharerId || !ownerId || !postId) return res.status(400).json('all fields are required')

  //user post
  const user = await User.findById(ownerId).exec()
  if(!user) return res.status(403).json('user not found') 

  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('posts not found')

  //check for duplicate
  const duplicate = await SharedPosts.findOne({sharedPost: {_id: post._id}}).exec()
  if(duplicate) return res.status(400).json('you already shared this post')

  if(!Object.values(post?.isShared).includes(sharerId)){

    if(post?.userId.equals(user?._id)){
      await post.updateOne({$push: {isShared: sharerId}})
      
      const {isShared, ...rest} = post._doc
      const sharedDate = sub(new Date(), { minutes: 0}).toISOString();
      const share = await SharedPosts.create({
        sharerId, sharedDate, sharedPost: rest
      })
      return res.status(201).json(share)
    }
    else return res.status(400).json('post does not belong to user')
  }
  else return res.status(400).json('you already shared this post')
})

//unshare a post
exports.unSharePost = asyncHandler(async(req, res) => {
  const {sharerId, ownerId, postId} = req.query
  if(!sharerId || !ownerId || !postId) return res.status(400).json('all fields are required')

  //user post
  const user = await User.findById(ownerId).exec()
  if(!user) return res.status(403).json('user not found') 

  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('posts not found')
  
  const postShared = await SharedPosts.findOne({sharerId}).exec()
  if(!postShared) return res.status(400).json('no shared posts')

  if(Object.values(post?.isShared).includes(sharerId)){

    if(post?.userId.equals(user?._id)){
      await post.updateOne({$pull: {isShared: sharerId}})
      await SharedPosts.deleteOne({_id: postShared._id})
      
      return res.status(200).json('you unShared this post')
    }
    else return res.status(400).json('post does not belong to user')
  }
  else return res.status(400).json('you already unShared this post')
})

//get shared post
exports.getSharedPost = asyncHandler(async(req, res) => {
  const {sharedPostId, userId} = req.params
  if(!sharedPostId || !userId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('you are unauthorized') 

  const post = await SharedPosts.findById(sharedPostId).exec()
  if(!post) return res.status(400).json('post not found')

  if(!post?.sharerId.equals(user?._id)) return res.status(400).json('no shared post')
  res.status(200).json(post)
})

//get user shared posts
exports.getUserSharedPosts = asyncHandler(async(req, res) => {
  const {sharerId} = req.params
  if(!sharerId) return res.status(400).json('all fields are required')

  const user = await User.findById(sharerId).exec()
  if(!user) return res.status(403).json('you are unauthorized') 

  const post = await SharedPosts.find({sharerId}).lean()
  if(!post) return res.status(400).json('post not found')

  if(!post?.sharerId.equals(user?._id)) return res.status(400).json('no shared post')
  res.status(200).json(post)
})

//get all shared post
exports.getAllSharedPosts = asyncHandler(async(req, res) => {
  const {ownerId} = req.params
  if(!ownerId) return res.status(400).json('all fields are required')

  const user = await User.findById(ownerId).exec()
  if(!user) return res.status(403).json('you are unauthorized') 

  const posts = await SharedPosts.find().lean()
  if(!posts?.length) return res.status(400).json('no shared posts')
  res.status(200).json(posts)
})

