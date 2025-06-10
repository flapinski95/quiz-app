"use client";
import Keycloak from "keycloak-js";

let keycloak = null;

if (typeof window !== "undefined") {
  keycloak = new Keycloak({
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
    realm: "quiz-app",
    clientId: "frontend",
  });
}

export default keycloak;