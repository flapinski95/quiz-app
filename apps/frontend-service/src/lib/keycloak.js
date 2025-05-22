"use client";
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://keycloak:8080/',
  realm: 'quiz-app',
  clientId: 'frontend',
});

export default keycloak;