// src/index.js
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const authRoutes = require('./routes/auth.routes');
const keycloakConfig = require('../keycloak.config');
const { createProxyMiddleware } = require("http-proxy-middleware");
const bodyParser = require('body-parser');
const extractKeycloakUser = require('./middlewares/extractKeycloakUser');
const verifyToken = require('./middlewares/verifyKeycloakToken');


const app = express();
app.use(express.json());
const memoryStore = new session.MemoryStore();
const cors = require('cors');
app.use((req, res, next) => {
  console.log(`[BODY LOGGER] ${req.method} ${req.originalUrl} ->`, req.body);
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
app.use(keycloak.middleware());


app.options('*', cors());
app.use("/api/auth", authRoutes);   



// const userProxy = createProxyMiddleware({
//   target: "http://user-service:3002",
//   changeOrigin: true,
//   pathRewrite: (path, req) => path.replace(/^\/api\/users/, ''),
//   onProxyReq: async (proxyReq, req) => {
//     try {
//       await new Promise((resolve, reject) => {
//         verifyToken(req, null, (err) => {
//           if (err) return reject(err);
//           resolve();
//         });
//       });

//       if (req.user?.keycloakId) {
//         proxyReq.setHeader("X-User-KeycloakId", req.user.keycloakId);
//         proxyReq.setHeader("X-User-Email", req.user.email || "");
//         console.log("[PROXY] Dodano X-User-KeycloakId:", req.user.keycloakId);
//       } else {
//         console.warn("[PROXY] Brak req.user – nie ustawiono nagłówków");
//       }
//     } catch (err) {
//       console.error("Błąd verifyToken w onProxyReq:", err);
//     }
//   },
// });
// const userProxy = createProxyMiddleware({
//   target: "http://user-service:3002",
//   changeOrigin: true,
//   pathRewrite: {
//     '^/api/users': '',
//   },
// });

// app.use("/api/users", keycloak.protect(), userProxy);

// app.use("/api/quizzes", keycloak.protect(), createProxyMiddleware({
//   target: "http://quiz-service:3003",
//   changeOrigin: true,
//   pathRewrite: (path, req) => path.replace(/^\/api\/quizzes/, ''),
//   onProxyReq: (proxyReq, req) => {
//     if (req.user?.keycloakId) {
//       proxyReq.setHeader("X-User-KeycloakId", req.user.keycloakId);
//       proxyReq.setHeader("X-User-Email", req.user.email || "");
//     } else {
//       console.warn("[PROXY] Brak req.user, nie ustawiono nagłówków X-User-*");
//     }
//   }
// }));


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
});
