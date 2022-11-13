
exports.verifyRoles = (roles) => {
   return (req, res, next) => {
      if(!req.roles) return res.sendStatus(403)
      const userRole = req.roles
      const allowedRoles = roles.map(role => userRole.includes(role)).find(res => res === true);
      if(!allowedRoles) return res.status(401).json('you are unauthorized')
      next()
   }
}