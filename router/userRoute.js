const router = require('express').Router();
const {verifyRoles} = require('../middleware/verifyRoles')
const {ROLES} = require('../config/allowedRoles');
const { 
  updateUserInfo, addOrRemoveAminRole, 
  addOrRemoveEditorRole, deleteAccount, 
  getUser, getAllUsers, followUser, 
  unfollowUser, userFriends, deleteAccountByAdmin } = require('../controller/usersController');

router.put('/updateInfo/:userId', verifyRoles([ROLES.USER, ROLES.EDITOR]), updateUserInfo)

router.put('/toggleAdminRole/:adminId/:userId', verifyRoles([ROLES.ADMIN]), addOrRemoveAminRole)

router.put('/toggleEditorRole/:adminId/:userId', verifyRoles([ROLES.ADMIN]), addOrRemoveEditorRole)

router.delete('/deleteAccount/:userId', verifyRoles([ROLES.USER]), deleteAccount)

router.delete('/deleteAccount', verifyRoles([ROLES.ADMIN]), deleteAccountByAdmin)

router.get('/getUser/:userId', verifyRoles([ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]), getUser)

router.get('/getUsers', verifyRoles([ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]), getAllUsers)

router.put('/followUser', verifyRoles([ROLES.USER]), followUser)

router.put('/unfollowUser', verifyRoles([ROLES.ADMIN, ROLES.USER]), unfollowUser)

router.get('/userFriends/:userId', verifyRoles([ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]), userFriends)

module.exports = router