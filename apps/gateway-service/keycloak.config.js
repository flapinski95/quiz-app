// keycloak.config.js
require('dotenv').config();

module.exports = {
  realm: "quiz-app",
  "auth-server-url": "http://localhost:8080",
  "ssl-required": "none",
  resource: "gateway-service",
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
  "confidential-port": 0
};