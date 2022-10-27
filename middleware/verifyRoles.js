
exports.verifyRoles = (roles) => {
   return (req, res, next) => {
      const userRole = req.roles
      const allowedRoles = roles.map(role => userRole.includes(role)).find(res => res === true);
      if(!allowedRoles) return res.status(401).json('you are not authorized')
      next()
   }
}