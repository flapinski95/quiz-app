// src/index.js
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const proxyRoutes = require('./routes/proxy.routes');
const secureRoutes = require('./routes/secure.routes');
const publicRoutes = require('./routes/public.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const memoryStore = new session.MemoryStore();
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // lub ['http://localhost:3000']
  credentials: true,
}));

app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore });
app.use(keycloak.middleware());

app.use(express.json());

app.use("/api/auth", authRoutes);          
app.use('/api/public', publicRoutes);       
app.use('/api/secure', keycloak.protect(), secureRoutes); 

app.use('/api/users', require('./middlewares/auth')(keycloak), proxyRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
});
