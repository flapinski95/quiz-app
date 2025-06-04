"use client";
import { createContext, useContext, useState, useEffect } from "react";
import keycloak from "../lib/keycloak";

const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localToken = localStorage.getItem("token");

    if (localToken) {
      localStorage.setItem("auth_method", "api");
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    keycloak
      .init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        flow: "standard",
      })
      .then((auth) => {
        if (auth) {
          localStorage.setItem("auth_method", "keycloak");
        }
        setAuthenticated(auth);
        setLoading(false);
      })
      .catch(() => {
        setAuthenticated(false);
        setLoading(false);
      });
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated, loading, setAuthenticated }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloakContext = () => useContext(KeycloakContext);