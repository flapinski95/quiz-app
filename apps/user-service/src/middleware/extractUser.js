module.exports = (req, res, next) => {
  const keycloakId = req.header('x-user-keycloakid');
  const email = req.header('x-user-email');

  if (!keycloakId) {
    return res.status(401).json({ message: 'Brak identyfikatora użytkownika' });
  }

  req.user = { keycloakId, email };
  next();
};