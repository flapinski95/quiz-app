const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'http://keycloak:8080/realms/quiz-app/protocol/openid-connect/certs',
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err || !key) {
      return callback(err || new Error('Brak klucza podpisującego'));
    }
  
    const signingKey = key.getPublicKey?.() || key.rsaPublicKey; 
    callback(null, signingKey);
  });
}

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Brak tokenu' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Nieprawidłowy token' });

    req.user = {
      keycloakId: decoded.sub,
      email: decoded.email,
      roles: decoded.realm_access?.roles || [],
    };
    next();
  });
};