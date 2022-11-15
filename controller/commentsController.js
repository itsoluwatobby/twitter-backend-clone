const User = require('../model/Users');
const CommentResponse = require('../model/CommentResponse');
const Comment = require('../model/Comments');
const Post = require('../model/Posts');
const asyncHandler = require('express-async-handler');
const { sub } = require('date-fns')

///create a comment
exports.createComment = asyncHandler(async(req, res) => {
  const newComment = req.body
  if(!newComment?.userId || !newComment?.postId || !newComment.body || !newComment?.commentDate) return res.status(400).json('all fields are required')

  const user = await User.findById(newComment?.userId).exec()
  if(!user) return res.status(403).json('user not found')
  
  const post = await Post.findById(newComment?.postId).exec()
  if(!post) return res.status(403).json('post not found')
  
  const comment = await Comment.create(newComment)
  comment && res.status(201).json(comment)
})

//update comment
exports.updateComments = asyncHandler(async(req, res) => {
  const {commentId} = req.params
  const editComment = req.body
  if(!editComment?.userId || !editComment?.postId || !editComment.body) return res.status(400).json('all fields are required')

  const user = await User.findById(editComment.userId).exec()
  if(!user) return res.status(403).json('user not found')
  
  const post = await Post.findById(editComment.postId).exec()
  if(!post) return res.status(403).json('post not found')
  
  const targetComment = await Comment.findOne({_id: commentId}).exec()
  if(!targetComment) return res.status(403).json('comment not found')
  
  const dateTime = sub(new Date(), { minutes: 0}).toISOString();

  if(!targetComment?.userId.equals(user?._id)) return res.sendStatus(403)
  await targetComment.updateOne({$set: editComment})
  await targetComment.updateOne({$set: {edited: true}})
  await targetComment.updateOne({$set: {editDate: dateTime}})

  const comment = await Comment.findOne({_id: commentId}).exec()
  comment && res.status(201).json(comment)
})

//delete comment by user
exports.deleteComment = asyncHandler(async(req, res) => {
  const {userId, commentId} = req.params
  if(!userId || !commentId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const userComment = await Comment.findById(commentId).exec()
  if(!userComment) return res.status(400).json('no comment from user')

  if(!userComment?.userId.equals(user?._id)) return res.sendStatus(401)
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

  const comments = await Comment.find({postId: post._id}).exec()
  if(!comments?.length) return res.status(400).json('no comments by user')

  await Comment.deleteMany({postId: post._id})
        .then(() => res.status(204).json('user comments deleted'))
        .catch(error => res.status(400).json('error deleting comments'))
})

//get all comment
exports.getAllComments = asyncHandler(async(req, res) => {
  const {userId} = req.params
  if(!userId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(400).json('user not found')

  const comments = await Comment.find().lean()
  if(!comments?.length) return res.status(400).json('comment not found') 

  res.status(200).json(comments)
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
exports.getUserCommentsByAdmin = asyncHandler(async(req, res) => {
  const {adminId, userId} = req.params
  if(!adminId || !userId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 
  if(!Object.values(user?.roles).includes('ADMIN')) return res.status(401).json('you are not authorised')

  const comments = await Comment.find({userId}).lean()
  if(!comments?.length) return res.status(400).json('user does not have comments')
  res.status(200).json(comments)
})

//get all comments in comments in post
exports.getAllCommentInPost = asyncHandler(async(req, res) => {
  const {postId} = req.params
  if(!postId) return res.status(400).json('all fields are required')

  const post = await Post.findById(postId).exec()
  if(!post) return res.status(400).json('post not found') 

  const comments = await Comment.find({postId: post._id}).lean()
  if(!comments?.length) return res.status(400).json('comment not found')
  res.status(200).json(comments)
})

//like and unlike a comment
exports.likeAndUnlikeComment = asyncHandler(async(req, res) => {
  const {userId, commentId} = req.params
  if(!userId || !commentId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const comment = await Comment.findById(commentId).exec()
  if(!comment) return res.status(400).json('comments not found')
  
  if(!Object.values(comment?.thumbsUp).includes(userId)){
    await comment.updateOne({$push: {thumbsUp: userId}})
    await comment.updateOne({$pull: {thumbsUpDown: userId}})
    return res.status(201).json('you liked this comment')
  }
  else{
    await comment.updateOne({$pull: {thumbsUp: userId}})
    return res.status(201).json('you unliked this comment')
  }
})

//like and unlike a post
exports.dislikeAndUnDislikeComment = asyncHandler(async(req, res) => {
  const {userId, commentId} = req.params
  if(!userId || !commentId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const comment = await Comment.findById(commentId).exec()
  if(!comment) return res.status(400).json('comments not found')
  
  if(!Object.values(comment?.thumbsUpDown).includes(userId)){
    await comment.updateOne({$push: {thumbsUpDown: userId}})
    await comment.updateOne({$pull: {thumbsUp: userId}})
    return res.status(201).json('you disliked this comment')
  }
  else{
    await comment.updateOne({$pull: {thumbsUpDown: userId}})
    return res.status(201).json('you unDisliked this comment')
  }
})


//................ RESPONSE ..................
exports.createResponse = asyncHandler(async(req, res) => {
  const newResponse = req.body
  if(!newResponse?.userId || !newResponse?.commentId || !newResponse.body) return res.status(400).json('all fields are required')

  const user = await User.findById(newResponse?.userId).exec()
  if(!user) return res.status(403).json('user not found')
  
  const comment = await Comment.findById(newResponse?.commentId).exec()
  if(!comment) return res.status(403).json('comment not found')
  
  const response = await CommentResponse.create(newResponse)
  comment && res.status(201).json(response)
})

//delete response on a comment
exports.deleteResponse = asyncHandler(async(req, res) => {
  const {userId, responseId} = req.params
  if(!userId || !responseId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const userResponse = await CommentResponse.findById(responseId).exec()
  if(!userResponse) return res.status(400).json('you do not have a post')

  if(!userResponse?.userId.equals(user?._id)) return res.sendStatus(403)
  await userResponse.deleteOne()
  res.status(204).json('response deleted')
})

//edit response in a comment
exports.editResponse = asyncHandler(async(req, res) => {
  const {responseId} = req.params
  const editResponse = req.body
  if(!editResponse?.userId || !editResponse?.commentId || !editResponse.body) return res.status(400).json('all fields are required')

  const user = await User.findById(editResponse.userId).exec()
  if(!user) return res.status(403).json('user not found')
  
  const comment = await Comment.findById(editResponse.commentId).exec()
  if(!comment) return res.status(403).json('comment not found')
  
  const targetResponse = await CommentResponse.findOne({_id: responseId}).exec()
  if(!targetResponse) return res.status(403).json('response not found')

  const dateTime = sub(new Date(), { minutes: 0}).toISOString();
  
  if(!targetResponse?.userId.equals(user?._id)) return res.sendStatus(403)
  await targetResponse.updateOne({$set: editResponse})
  await targetResponse.updateOne({$set: {edited: true}})
  await targetResponse.updateOne({$set: {editDate: dateTime}})

  const response = await CommentResponse.findOne({_id: responseId}).exec()
  response && res.status(201).json(response)
})

//get all responses on a comment
exports.getAllResponseInComment = asyncHandler(async(req, res) => {
  const {userId, commentId} = req.params
  if(!userId || !commentId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 
  
  const comment = await Comment.findById(commentId).exec()
  if(!comment) return res.status(400).json('comment not found') 

  const response = await CommentResponse.find({commentId: comment._id}).lean()
  if(!response?.length) return res.status(400).json('response not found')
  res.status(200).json(response)
})

//get a response
exports.getResponse = asyncHandler(async(req, res) => {
  const {commentId, responseId} = req.params
  if(!commentId || !responseId) return res.status(400).json('all fields are required')

  const comment = await Comment.findById(commentId).exec()
  if(!comment) return res.status(400).json('comment not found')

  const response = await CommentResponse.findById(responseId).exec()
  if(!response) return res.status(400).json('response not found') 

  res.status(200).json(response)
})

//get a response
exports.getAllResponse = asyncHandler(async(req, res) => {
  const {userId} = req.params
  if(!userId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(400).json('user not found')

  const responses = await CommentResponse.find().lean()
  if(!responses?.length) return res.status(400).json('responses not found') 

  res.status(200).json(responses)
})

//like and unlike a response
exports.likeAndUnlikeResponse = asyncHandler(async(req, res) => {
  const {userId, responseId} = req.params
  if(!userId || !responseId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const response = await CommentResponse.findById(responseId).exec()
  if(!response) return res.status(400).json('response not found')
  
  if(!Object.values(response?.thumbsUp).includes(userId)){
    await response.updateOne({$push: {thumbsUp: userId}})
    await response.updateOne({$pull: {thumbsUpDown: userId}})
    return res.status(201).json('you liked this response')
  }
  else{
    await response.updateOne({$pull: {thumbsUp: userId}})
    return res.status(201).json('you unliked this response')
  }
})

//dislike and undislike a response
exports.dislikeAndUnDislikeResponse = asyncHandler(async(req, res) => {
  const {userId, responseId} = req.params
  if(!userId || !responseId) return res.status(400).json('all fields are required')

  const user = await User.findById(userId).exec()
  if(!user) return res.status(403).json('user not found') 

  const response = await CommentResponse.findById(responseId).exec()
  if(!response) return res.status(400).json('response not found')
  
  if(!Object.values(response?.thumbsUpDown).includes(userId)){
    await response.updateOne({$push: {thumbsUpDown: userId}})
    await response.updateOne({$pull: {thumbsUp: userId}})
    return res.status(201).json('you disliked this response')
  }
  else{
    await response.updateOne({$pull: {thumbsUpDown: userId}})
    return res.status(201).json('you unDisliked this response')
  }
})
