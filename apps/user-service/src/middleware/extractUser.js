module.exports = (req, res, next) => {
    const keycloakId = req.header('X-User-KeycloakId');
    const email = req.header('X-User-Email');
  
    console.log("[extractUser] Nagłówki:", req.headers);
    console.log('[extractUser] X-User-KeycloakId:', req.header('X-User-KeycloakId'));
  
    if (!keycloakId) {
      return res.status(401).json({ message: 'Brak identyfikatora użytkownika' });
    }
  
    req.user = { keycloakId, email };
    next();
  };