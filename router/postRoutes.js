const router = require('express').Router();
const {verifyRoles} = require('../middleware/verifyRoles')
const {ROLES} = require('../config/allowedRoles');
const { 
   createPosts, updatePost, deletePosts, 
   deletePostByAdmin, deleteUsersPostsByAdmin, 
   getPost, getAllPosts, getUserPosts, 
   likeAndUnlikePosts, sharePost, unSharePost, 
   getUserSharedPosts, getAllSharedPosts, getSharedPost
} = require('../controller/postController');

router.post('/createPost', verifyRoles([ROLES.USER]), createPosts)

router.put('/updatePost/:postId', verifyRoles([ROLES.USER]), updatePost)

router.delete('/deletePost/:userId/:postId', verifyRoles([ROLES.USER]), deletePosts)

router.delete('/adminPostDelete/:adminId/:postId', verifyRoles([ROLES.ADMIN]), deletePostByAdmin)

//query adminId and userId
router.delete('/deleteUserPosts', verifyRoles([ROLES.ADMIN]), deleteUsersPostsByAdmin)

router.get('/getPost/:postId', verifyRoles([ROLES.USER]), getPost)

router.get('/getAllPosts', verifyRoles([ROLES.USER, ROLES.EDITOR, ROLES.ADMIN]), getAllPosts)

router.get('/getUserPosts/:userId', verifyRoles([ROLES.USER]), getUserPosts)

router.put('/likeAndUnlikePost/:userId/:postId', verifyRoles([ROLES.USER]), likeAndUnlikePosts)

//router.put('/dislikeAndUnDislikePost/:userId/:postId', verifyRoles([ROLES.USER]), dislikeAndUnDislikePosts)

// query sharerId, ownerId and postId
router.post('/sharePost', verifyRoles([ROLES.USER]), sharePost)

// query sharerId, ownerId and postId
router.delete('/unSharePost', verifyRoles([ROLES.USER]), unSharePost)

router.get('/getSharedPost/:userId/:sharedPostId', verifyRoles([ROLES.USER]), getSharedPost)

router.get('/getUserSharedPost/:sharerId', verifyRoles([ROLES.USER]), getUserSharedPosts)

router.get('/getAllSharedPost/:ownerId', verifyRoles([ROLES.USER]), getAllSharedPosts)

module.exports = router

