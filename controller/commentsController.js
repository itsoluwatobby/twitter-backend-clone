const User = require('../model/User');
const CommentResponse = require('../model/CommentResponse');
const Comment = require('../model/Comments');
const Post = require('../model/Posts');
const asyncHandler = require('express-async-handler');
const { sub } = require('date-fns')

///create a comment
exports.createComment = asyncHandler(async(req, res) => {
  const newComment = req.body
  if(!newComment?.userId || !newComment?.postId || !newComment.body) return res.status(400).json('all fields are required')

  const user = await User.findById(newComment?.userId).exec()
  if(!user) return res.status(403).json('user not found')
  
  const post = await Post.findById(newComment?.postId).exec()
  if(!post) return res.status(403).json('user not found')
  
  const comment = await Comment.create(newComment)
  comment && res.status(201).json('comment created')
})

//update comment
exports.updateComments = asyncHandler(async(req, res) => {
  const {commentId} = req.params
  const editComment = req.body
  if(!editComment?.userId || !editComment?.postId || !editComment.body) return res.status(400).json('all fields are required')

  const user = await User.findById(editComment.userId).exec()
  if(!user) return res.status(403).json('user not found')
  
  const post = await Post.findById(editComment.postId).exec()
  if(!post) return res.status(403).json('user not found')
  
  const targetComment = await Comment.findOne({_id: commentId}).exec()
  if(!post) return res.status(403).json('user not found')
  
  if(targetComment?.userId !== user?._id) return res.sendStatus(401)
  const comment = await userPost.updateOne({$set: editComment})

  post && res.status(201).json(comment)
})

//delete comment by user
exports.deleteComment = asyncHandler(async(req, res) => {
  const {userId, commentId} = req.params
  if(!userId || !commentId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const userComment = await Comment.findById(commentId).exec()
  if(!userComment) return res.status(400).json('you do not have a post')

  if(userComment?.userId !== user?._id) return res.sendStatus(401)
  await userComment.deleteOne()
  res.status(204).json('comment deleted')
})

//delete comment by admin
exports.deleteCommentByAdmin = asyncHandler(async(req, res) => {
  const {adminId, commentId} = req.params
  if(!adminId || !commentId) return res.status(400).json('all fields are required')

  const user = await User.findById(adminId).exec()
  if(!user) return res.status(403).json('user not found') 
  if(!Object.values(user?.roles).includes('ADMIN')) return res.status(401).json('you are not authorised')

  const comment = await Comment.findById(commentId).exec()
  if(!comment) return res.status(400).json('comment not found')

  await comment.deleteOne()
  res.status(204).json('comment deleted')
})

//delete user comment on post by admin
exports.deleteUsersCommentsByAdmin = asyncHandler(async(req, res) => {
  const {adminId, postId} = req.query
  if(!adminId || !postId) return res.status(400).json('all fields are required')

  const user = await User.findById(adminId).exec()
  if(!user) return res.status(403).json('user not found') 
  if(!Object.values(user?.roles).includes('ADMIN')) return res.status(401).json('you are not authorised')

  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('post not found') 

  const comments = await Comment.find({postId: post._id}).lean()
  if(!comments?.length) return res.status(400).json('user does not have a comment')
  
  await comments.deleteMany()
  res.status(204).json('user comments deleted')
})

//get a comment
exports.getComment = asyncHandler(async(req, res) => {
  const {commentId, postId} = req.params
  if(!commentId || !postId) return res.status(400).json('all fields are required')

  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('post not found')

  const comment = await Comment.findById(commentId).exec()
  if(!comment) return res.status(400).json('comment not found') 

  res.status(200).json(comment)
})

//get user's comments by admin
exports.getUserComments = asyncHandler(async(req, res) => {
  const {adminId, userId} = req.params
  if(!adminId || !userId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 
  if(!Object.values(user?.roles).includes('ADMIN')) return res.status(401).json('you are not authorised')

  const comments = await Comment.find({userId}).lean()
  if(!comments?.length) return res.status(400).json('user does not have comments')
  res.status(200).json(comments)
})

//get all comments in post
exports.getAllComment = asyncHandler(async(req, res) => {
  const {userId, postId} = req.params
  if(!userId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const comment = await Post.find().lean()
  if(!comment?.length) return res.status(400).json('comment not found')
  res.status(200).json(comment)
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


//................ RESPONSE ..................
exports.postResponse = asyncHandler(async(req, res) => {
  
})

//delete comment on a post
exports.deleteResponse = asyncHandler(async(req, res) => {
  
})

//update comment on a post
exports.editResponse = asyncHandler(async(req, res) => {
  
})

//get all comments on a post
exports.getResponses = asyncHandler(async(req, res) => {
  
})

//get a comment
exports.getResponse = asyncHandler(async(req, res) => {
  
})

//like and unlike comment
exports.likeAndUnlikeResponse = asyncHandler(async(req, res) => {
  
})

