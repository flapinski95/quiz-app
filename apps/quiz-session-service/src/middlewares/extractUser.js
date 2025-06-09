module.exports = (req, res, next) => {
    const keycloakId = req.header('x-user-keycloakid');
    const email = req.header('x-user-email');
    const roles = req.header('x-user-roles') ? req.header('x-user-roles').split(',') : [];
  
    if (!keycloakId) {
      return res.status(401).json({ message: 'Brak identyfikatora użytkownika' });
    }
  
    req.user = { keycloakId, email, roles};
    next();
  };