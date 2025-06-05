"use client";
import { createContext, useContext, useState, useEffect } from "react";
import keycloak from "../lib/keycloak";

const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localToken = localStorage.getItem("token");

    keycloak
      .init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: "S256",
        flow: "standard",
      })
      .then((auth) => {
        if (auth && keycloak.token) {
          localStorage.setItem("token", keycloak.token);
          setAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setAuthenticated(false);
        }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setAuthenticated(false);
        setLoading(false);
      });

    const interval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak
          .updateToken(60)
          .then((refreshed) => {
            if (refreshed && keycloak.token) {
              localStorage.setItem("token", keycloak.token);
            }
          })
          .catch(() => {
            console.warn("Token wygasł – wylogowuję");
            keycloak.logout();
          });
      }
    }, 60000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated, loading, setAuthenticated }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloakContext = () => useContext(KeycloakContext);