"use client";
import LoginForm from "@/components/LoginForm";
import { useKeycloakContext } from "../context/KeycloakContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { keycloak, authenticated, loading } = useKeycloakContext();
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState(null);

  useEffect(() => {
    const method = localStorage.getItem("auth_method");
    setAuthMethod(method);
  }, [authenticated]);

  if (loading) return <p>Loading...</p>;

  if (!authenticated) {
    return (
      <div>
        <h1>Zaloguj się</h1>
        <button onClick={() => keycloak.login({ redirectUri: "http://localhost:3000/home" })}>
          Zaloguj się
        </button>
        <button onClick={() => keycloak.register()}>Nie masz konta? Zarejestruj się</button>
        <button onClick={() => keycloak.login({ idpHint: "google",redirectUri: "http://localhost:3000/home" })}>Zaloguj przez Google</button>
      </div>
    );
  }

}