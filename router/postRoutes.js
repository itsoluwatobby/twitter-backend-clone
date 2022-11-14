const router = require('express').Router();
const {verifyRoles} = require('../middleware/verifyRoles')
const {ROLES} = require('../config/allowedRoles');
const { 
   createPosts, updatePost, deletePosts, 
   deletePostByAdmin, deleteUsersPostsByAdmin, 
   getPost, getAllPosts, getUserPosts, likeAndUnlikePosts, 
   dislikeAndUnDislikePosts, sharePost } = require('../controller/postController');

router.post('/createPost', verifyRoles([ROLES.USER]), createPosts)

router.put('/updatePost/:postId', verifyRoles([ROLES.USER]), updatePost)

router.delete('/deletePost/:userId/:postId', verifyRoles([ROLES.USER]), deletePosts)

router.delete('/adminPostDelete/:adminId/:postId', verifyRoles([ROLES.ADMIN]), deletePostByAdmin)

//query adminId and userId
router.delete('/deleteUserPosts', verifyRoles([ROLES.ADMIN]), deleteUsersPostsByAdmin)

router.get('/getPost/:postId', verifyRoles([ROLES.USER]), getPost)

router.get('/getAllPosts/:userId', verifyRoles([ROLES.USER, ROLES.EDITOR, ROLES.ADMIN]), getAllPosts)

router.get('/getUserPosts/:userId', verifyRoles([ROLES.USER]), getUserPosts)

router.put('/like&unlikePost/:userId/:postId', verifyRoles([ROLES.USER]), likeAndUnlikePosts)

router.put('/dislike&unDislikePost/:userId/:postId', verifyRoles([ROLES.USER]), dislikeAndUnDislikePosts)

router.post('/sharePost/:sharerId/:userId/:postId', verifyRoles([ROLES.USER]), sharePost)

module.exports = router

