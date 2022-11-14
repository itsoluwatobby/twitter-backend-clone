const router = require('express').Router();
const {verifyRoles} = require('../middleware/verifyRoles')
const {ROLES} = require('../config/allowedRoles');
const { 
  updateUserInfo, toggleAdminRole, 
  toggleEditorRole, deleteAccount, 
  getUser, getAllUsers, followUser, 
  unfollowUser, userFriends, 
  deleteAccountByAdmin, lockOrUnlockAccount } = require('../controller/usersController');

router.put('/updateInfo/:userId', verifyRoles([ROLES.USER, ROLES.EDITOR]), updateUserInfo)

router.put('/toggleAdminRole/:adminId/:userId', verifyRoles([ROLES.ADMIN]), toggleAdminRole)

router.put('/toggleEditorRole/:adminId/:userId', verifyRoles([ROLES.ADMIN]), toggleEditorRole)

router.delete('/deleteAccount/:userId', verifyRoles([ROLES.USER]), deleteAccount)

//query adminId and userId
router.delete('/deleteAccount', verifyRoles([ROLES.ADMIN]), deleteAccountByAdmin)

router.get('/getUser/:userId', verifyRoles([ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]), getUser)

router.get('/getUsers', verifyRoles([ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]), getAllUsers)

//query followerId and followingId
router.put('/followUser', verifyRoles([ROLES.USER]), followUser)

//query followerId and followingId
router.put('/unfollowUser', verifyRoles([ROLES.ADMIN, ROLES.USER]), unfollowUser)

router.get('/userFriends/:userId', verifyRoles([ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]), userFriends)

router.put('/lockAndUnlockAccount/:adminId/:userId', verifyRoles([ROLES.ADMIN, ROLES.EDITOR]), lockOrUnlockAccount)

module.exports = router
