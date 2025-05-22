"use client";
import { createContext, useContext, useState, useEffect } from "react";
import keycloak from "../../lib/keycloak";

const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        flow: "standard",
      })
      .then((auth) => {
        setAuthenticated(auth);
        setLoading(false);
      })
      .catch(() => {
        setAuthenticated(false);
        setLoading(false);
      });
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated, loading }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloakContext = () => useContext(KeycloakContext);