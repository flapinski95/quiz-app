'use client';
import { useKeycloakContext } from '../context/KeycloakContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { keycloak, authenticated, loading } = useKeycloakContext();
  const router = useRouter();

  // useEffect(() => {
  //   if (!loading && authenticated) {
  //     router.push("/home");
  //   }
  // }, [authenticated, loading]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Zaloguj się</h1>
      <button onClick={() => keycloak.login({ redirectUri: 'http://localhost:3000/home' })}>
        Zaloguj się
      </button>
      <button onClick={() => keycloak.register()}>Nie masz konta? Zarejestruj się</button>
      <button
        onClick={() =>
          keycloak.login({ idpHint: 'google', redirectUri: 'http://localhost:3000/home' })
        }
      >
        Zaloguj przez Google
      </button>
    </div>
  );
}
