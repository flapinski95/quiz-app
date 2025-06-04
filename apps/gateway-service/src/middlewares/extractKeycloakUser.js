// src/middlewares/extractKeycloakUser.js
module.exports = (req, res, next) => {
    if (!req.kauth || !req.kauth.grant) {
      return res.status(401).json({ message: 'Brak uwierzytelnienia' });
    }
  
    const token = req.kauth.grant.access_token;
    req.user = {
      keycloakId: token.content.sub,
      email: token.content.email,
      roles: token.content.realm_access?.roles || [],
    };
  
    next();
  };