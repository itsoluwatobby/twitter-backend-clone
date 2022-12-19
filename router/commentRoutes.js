const router = require('express').Router();
const {verifyRoles} = require('../middleware/verifyRoles')
const {ROLES} = require('../config/allowedRoles');
const { 
  createComment, updateComments, 
  deleteComment, deleteCommentByAdmin, 
  deleteUsersCommentsByAdmin, getUserCommentsByAdmin, 
  getComment, getAllCommentInPost, likeAndUnlikeComment, 
  dislikeAndUnDislikeComment, createResponse, editResponse, 
  deleteResponse, getResponse, getAllResponseInComment, likeAndUnlikeResponse, dislikeAndUnDislikeResponse, getAllComments, getAllResponse, deleteCommentByPostOwner, deleteResponseByPostOwner} = require('../controller/commentsController');


//................... COMMENT ROUTES ........................

router.post('/createComment', verifyRoles([ROLES.USER]), createComment)

router.put('/updateComment/:commentId', verifyRoles([ROLES.USER]), updateComments)

router.delete('/deleteComment/:userId/:commentId', verifyRoles([ROLES.USER]), deleteComment)

router.delete('/deleteCommentByPostOwner/:ownerId/:commentId', verifyRoles([ROLES.USER]), deleteCommentByPostOwner)

router.delete('/adminCommentDelete/:adminId/:commentId', verifyRoles([ROLES.ADMIN]), deleteCommentByAdmin)

//query adminId and postId
router.delete('/deleteUserComments', verifyRoles([ROLES.ADMIN]), deleteUsersCommentsByAdmin)

router.get('/getComments/:userId', verifyRoles([ROLES.USER]), getAllComments)

router.get('/getComment/:commentId/:postId', verifyRoles([ROLES.USER]), getComment)

router.get('/getUserComments/:adminId/:userId', verifyRoles([ROLES.EDITOR, ROLES.ADMIN]), getUserCommentsByAdmin)

router.get('/getCommentsInPost/:postId', verifyRoles([ROLES.USER]), getAllCommentInPost)

router.put('/likeAndUnlikeComment/:userId/:commentId', verifyRoles([ROLES.USER]), likeAndUnlikeComment)

router.put('/dislikeAndUnDislikeComment/:userId/:commentId', verifyRoles([ROLES.USER]), dislikeAndUnDislikeComment)


//......................... RESPONSE ROUTES .........................

router.post('/createResponse', verifyRoles([ROLES.USER]), createResponse)

router.put('/editResponse/:responseId', verifyRoles([ROLES.USER]), editResponse)

router.delete('/deleteResponse/:userId/:responseId', verifyRoles([ROLES.USER]), deleteResponse)

router.delete('/deleteResponseByPostOwner/:ownerId/:commentId/:responseId', verifyRoles([ROLES.USER]), deleteResponseByPostOwner)

router.get('/getResponse/:commentId/:responseId', verifyRoles([ROLES.USER]), getResponse)

router.get('/getResponseInComment/:userId/:commentId', verifyRoles([ROLES.USER]), getAllResponseInComment)

router.get('/getAllResponse/:userId', verifyRoles([ROLES.USER]), getAllResponse)

router.put('/likeAndUnlikeResponse/:userId/:responseId', verifyRoles([ROLES.USER]), likeAndUnlikeResponse)

router.put('/dislikeAndUnDislikeResponse/:userId/:responseId', verifyRoles([ROLES.USER]), dislikeAndUnDislikeResponse)

module.exports = router

