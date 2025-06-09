module.exports = (req, res, next) => {
    const keycloakId = req.headers['x-user-keycloakid'];
    const rolesHeader = req.headers['x-user-roles'];
  
    console.log('[verifyInternalRequest] headers:', req.headers);
  
    let roles = [];
    try {
      roles = JSON.parse(rolesHeader || '[]');
    } catch (err) {
      console.error('[verifyInternalRequest] Błąd parsowania roles:', err.message);
      return res.status(403).json({ message: 'Brak uprawnień (złe role)' });
    }
  
    if (!keycloakId || !Array.isArray(roles)) {
      return res.status(403).json({ message: 'Brak uprawnień (internal only)' });
    }
  
    // ewentualnie: sprawdzisz czy admin
    // if (!roles.includes('admin')) return res.status(403).json({ message: 'Admin only' });
  
    next();
  };