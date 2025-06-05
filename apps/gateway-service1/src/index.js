const express = require('express');
const Keycloak = require('keycloak-connect');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const dotenv = require('dotenv');
const verifyToken = require('./middlewares/verifyToken');
const keycloakConfig = require('../keycloak.config');
const proxy = require('express-http-proxy');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

const keycloak = new Keycloak({}, keycloakConfig);

// 👇 Nie używamy keycloak.middleware() ani express-session!

// 👇 Token JWT – weryfikacja na bazie certów z Keycloaka
app.use('/api/users',
  (req, res, next) => {
    console.log('[GATEWAY] /api/users Authorization:', req.headers.authorization);
    next();
  },
  verifyToken,
  proxy(process.env.USER_SERVICE_URL || 'http://localhost:3002', {
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
      if (srcReq.user) {
        proxyReqOpts.headers['x-user-keycloakid'] = srcReq.user.keycloakId;
        proxyReqOpts.headers['x-user-email'] = srcReq.user.email;
      }
      return proxyReqOpts;
    }
  })
);

// 👇 Można też dodać inne trasy, też chronione verifyToken
app.use('/api/quiz',
  verifyToken,
  createProxyMiddleware({
    target: process.env.QUIZ_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^/api/quiz': '/' },
  })
);

// 🔓 publiczne endpointy (np. logowanie, rejestracja)
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));