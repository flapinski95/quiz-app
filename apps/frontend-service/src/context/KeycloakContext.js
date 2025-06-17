'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import keycloak from '../lib/keycloak';

const KeycloakContext = createContext({
  keycloak: null,
  authenticated: false,
  loading: true,
});

export const KeycloakProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const silentCheckUri = `${window.location.origin}/silent-check-sso.html`;

    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: silentCheckUri,
        pkceMethod: 'S256',
        flow: 'standard',
        checkLoginIframe: true,
      })
      .then((authenticated) => {
        setAuthenticated(authenticated);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Keycloak init error:', err);
        setAuthenticated(false);
        setLoading(false);
      });

    const refreshInterval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak
          .updateToken(60)
          .then((refreshed) => {
            if (refreshed) {
              console.log('[Keycloak] Token refreshed');
            }
          })
          .catch((err) => {
            console.warn('[Keycloak] Token refresh failed – logging out');
            keycloak.logout();
          });
      }
    }, 60000);

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => {
        console.warn('[Keycloak] Token expired – logging out');
        keycloak.logout();
      });
    };

    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated, loading }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloakContext = () => useContext(KeycloakContext);
