"use client";
import Keycloak from "keycloak-js";

let keycloak = null;

if (typeof window !== "undefined") {
  keycloak = new Keycloak({
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://auth.localhost",
    realm: "quiz-app",
    clientId: "frontend",
  });
}

export default keycloak;