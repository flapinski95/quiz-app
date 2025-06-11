const jwt = require("jsonwebtoken");
const jwksRsa = require("jwks-rsa");

const client = jwksRsa({
  jwksUri: "http://auth.localhost/realms/quiz-app/protocol/openid-connect/certs",
  cache: true,
  rateLimit: true,
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Błąd pobierania klucza publicznego:", err);
      return callback(err);
    }

    const signingKey = key?.getPublicKey?.() || key?.rsaPublicKey;
    if (!signingKey) {
      console.error("Nie znaleziono klucza publicznego w odpowiedzi:", key);
      return callback(new Error("Brak klucza publicznego"));
    }

    callback(null, signingKey);
  });
};

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Brak tokena Bearer" });
  }

  const token = auth.split(" ")[1];
  console.log("[verifyToken] Otrzymany token:", token);

  try {
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
    console.log("[verifyToken] Header JWT:", header);
  } catch (e) {
    console.warn("Nieprawidłowy nagłówek tokena.");
  }

  jwt.verify(
    token,
    getKey,
    {
      issuer: "http://auth.localhost/realms/quiz-app",
      algorithms: ["RS256"],
      audience: ["account"],
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
        username: decoded.preferred_username || decoded.name || decoded.email?.split('@')[0] || 'anonymous'
      };

      console.log("[verifyToken] Użytkownik:", req.user);
      next();
    }
  );
};