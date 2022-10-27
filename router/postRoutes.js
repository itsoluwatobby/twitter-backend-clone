const router = require('express').Router();
const {verifyRoles} = require('../middleware/verifyRoles')
const {roles} = require('../config/allowedRoles')

router.get('/admin', verifyRoles([roles.ADMIN]), (req, res) => {
   res.json('admin page')
})
router.get('/editor', verifyRoles([roles.EDITOR, roles.ADMIN]), (req, res) => {
   res.json('editor page')
})
router.get('/user', verifyRoles([roles.USER]), (req, res) => {
   res.json('user page')
})

module.exports = router

