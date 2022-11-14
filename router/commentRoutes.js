const router = require('express').Router();
const {verifyRoles} = require('../middleware/verifyRoles')
const {ROLES} = require('../config/allowedRoles');
const { 
  createComment, updateComments, 
  deleteComment, deleteCommentByAdmin, 
  deleteUsersCommentsByAdmin, getUserCommentsByAdmin, 
  getComment, getAllCommentInPost, likeAndUnlikeComment, 
  dislikeAndUnDislikeComment, createResponse, editResponse, 
  deleteResponse, getResponse, getAllResponseInComment, likeAndUnlikeResponse, dislikeAndUnDislikeResponse} = require('../controller/commentsController');


//................... COMMENT ROUTES ........................

router.post('/createComment', verifyRoles([ROLES.USER]), createComment)

router.put('/updateComment/:commentId', verifyRoles([ROLES.USER]), updateComments)

router.delete('/deleteComment/:userId/:commentId', verifyRoles([ROLES.USER]), deleteComment)

router.delete('/adminCommentDelete/:adminId/:commentId', verifyRoles([ROLES.ADMIN]), deleteCommentByAdmin)

//query adminId and postId
router.delete('/deleteUserComments', verifyRoles([ROLES.ADMIN]), deleteUsersCommentsByAdmin)

router.get('/getComment/:commentId/:postId', verifyRoles([ROLES.USER]), getComment)

router.get('/getUserComments/:adminId/:userId', verifyRoles([ROLES.EDITOR, ROLES.ADMIN]), getUserCommentsByAdmin)

router.get('/getCommentsInPost/:postId', verifyRoles([ROLES.USER]), getAllCommentInPost)

router.put('/like&unlikeComment/:userId/:commentId', verifyRoles([ROLES.USER]), likeAndUnlikeComment)

router.put('/dislike&unDislikeComment/:userId/:commentId', verifyRoles([ROLES.USER]), dislikeAndUnDislikeComment)


//......................... RESPONSE ROUTES .........................

router.post('/createResponse', verifyRoles([ROLES.USER]), createResponse)

router.put('/editResponse/:responseId', verifyRoles([ROLES.USER]), editResponse)

router.delete('/deleteResponse/:userId/:responseId', verifyRoles([ROLES.USER]), deleteResponse)

router.get('/getResponse/:commentId/:responseId', verifyRoles([ROLES.USER]), getResponse)

router.get('/getResponseInComment/:userId/:commentId', verifyRoles([ROLES.EDITOR, ROLES.ADMIN]), getAllResponseInComment)

router.put('/like&unlikeResponse/:userId/:responseId', verifyRoles([ROLES.USER]), likeAndUnlikeResponse)

router.put('/dislike&unDislikeResponse/:userId/:responseId', verifyRoles([ROLES.USER]), dislikeAndUnDislikeResponse)

module.exports = router

