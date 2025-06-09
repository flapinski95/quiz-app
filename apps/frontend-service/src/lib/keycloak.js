"use client";
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost/auth/',
  realm: 'quiz-app',
  clientId: 'frontend',
});

export default keycloak;