const jwt = require("jsonwebtoken");
const jwksRsa = require("jwks-rsa");

const client = jwksRsa({
  jwksUri: "http://keycloak:8080/realms/quiz-app/protocol/openid-connect/certs",
  cache: true,
  rateLimit: true,
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Brak tokena Bearer" });
  }

  const token = auth.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: "http://localhost/auth/realms/quiz-app", // ← UWAGA: localhost, nie keycloak
      algorithms: ["RS256"],
      audience: ["frontend", "account"],  // ← możesz dodać z powrotem jak zadziała mapper
    },
    (err, decoded) => {
      if (err) {
        console.error("Błąd weryfikacji tokena:", err);
        return res.status(401).json({ message: "Nieprawidłowy token" });
      }

      req.user = {
        keycloakId: decoded.sub,
        email: decoded.email,
        roles: decoded.realm_access?.roles || [],
      };
      console.log("[verifyToken] Użytkownik:", req.user);
      next();
    }
  );
};