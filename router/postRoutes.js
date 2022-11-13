const router = require('express').Router();
const {verifyRoles} = require('../middleware/verifyRoles')
const {ROLES} = require('../config/allowedRoles')

router.get('/admin', verifyRoles([ROLES.ADMIN]), (req, res) => {
   res.json('admin page')
})
router.get('/editor', verifyRoles([ROLES.EDITOR, ROLES.ADMIN]), (req, res) => {
   res.json('editor page')
})
router.get('/user', verifyRoles([ROLES.USER]), (req, res) => {
   res.json('user page')
})

module.exports = router

