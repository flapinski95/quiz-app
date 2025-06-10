const express = require('express');
// const Keycloak = require('keycloak-connect');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const dotenv = require('dotenv');
const verifyToken = require('./middlewares/verifyToken');
// const keycloakConfig = require('../keycloak.config');
const proxy = require('express-http-proxy');
const isAdmin = require('./middlewares/isAdmin');
const axios = require('axios');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

app.delete('/api/users/:id',
  verifyToken,
  isAdmin, 
  async (req, res) => {
    const userId = req.params.id;
    const keycloakId = req.user.keycloakId;

    try {
      await deleteFromKeycloak(userId); 

      const response = await axios.delete(`${process.env.USER_SERVICE_URL}/internal/users/${userId}`, {
        headers: {
          'x-user-keycloakid': keycloakId,
          'x-user-roles': JSON.stringify(req.user.roles || []),
          
        }
      });

      res.status(200).json({ message: 'Użytkownik usunięty' });
    } catch (err) {
      console.error('Błąd usuwania użytkownika:', err.message);
      res.status(500).json({ message: 'Błąd usuwania użytkownika', error: err.message });
    }
  }
);
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
        proxyReqOpts.headers['x-user-roles'] = srcReq.user.roles || [];
        proxyReqOpts.headers['x-user-username'] = srcReq.user.username || '';
      }
      return proxyReqOpts;
    }
  })
);

app.use('/api/quizzes',
  (req, res, next) => {
    console.log('[GATEWAY] /api/quizzes Authorization:', req.headers.authorization);
    next();
  },
  verifyToken,
  proxy(process.env.QUIZ_SERVICE_URL || 'http://localhost:3003', {
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
      if (srcReq.user) {
        proxyReqOpts.headers['x-user-keycloakid'] = srcReq.user.keycloakId;
        proxyReqOpts.headers['x-user-email'] = srcReq.user.email;
        proxyReqOpts.headers['x-user-roles'] = srcReq.user.roles?.join(',') || '';
      }
      return proxyReqOpts;
    }
  })
);

app.use('/api/sessions',
  (req, res, next) => {
    console.log('[GATEWAY] /api/sessions Authorization:', req.headers.authorization);
    next();
  },
  verifyToken,
  proxy(process.env.SESSION_SERVICE_URL || 'http://localhost:3004', {
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
      if (srcReq.user) {
        proxyReqOpts.headers['x-user-keycloakid'] = srcReq.user.keycloakId;
        proxyReqOpts.headers['x-user-email'] = srcReq.user.email;
        proxyReqOpts.headers['x-user-roles'] = srcReq.user.roles || [];
      }
      return proxyReqOpts;
    }
  })
);


app.use('/api/auth', require('./routes/authRoutes'));



async function getAdminToken() {
  const clientSecret = process.env.ADMIN_CLIENT_SECRET || fs.readFileSync(process.env.ADMIN_CLIENT_SECRET_FILE, 'utf8').trim();

  const res = await axios.post('http://quiz.localhost/realms/quiz-app/protocol/openid-connect/token', new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.ADMIN_CLIENT_ID,
    client_secret: clientSecret
  }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return res.data.access_token;
}

async function deleteFromKeycloak(keycloakUserId) {
  const token = await getAdminToken();
  await axios.delete(`http://quiz.localhost/realms/quiz-app/users/${keycloakUserId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));