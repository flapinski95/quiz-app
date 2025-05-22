"use client";
import { useState, useEffect } from "react";
import keycloak from "../lib/keycloak";

export function useKeycloakInit() {
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({ onLoad: "check-sso", pkceMethod: "S256" }).then((auth) => {
      setAuthenticated(auth);
    });
  }, []);

  return { keycloak, isAuthenticated };
}