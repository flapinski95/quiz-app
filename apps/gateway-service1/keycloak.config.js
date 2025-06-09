// const session = require('express-session');
// const Keycloak = require('keycloak-connect');

// const memoryStore = new session.MemoryStore(); 

// const keycloakConfig = {
//   clientId: 'frontend',
//   bearerOnly: true,         
//   serverUrl: 'http://localhost:8080',
//   realm: 'quiz-app',
//   credentials: {
//     secret: process.env.KEYCLOAK_CLIENT_SECRET  
//   }
// };

// // const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

// module.exports = {
//   memoryStore,
//   keycloak
// };