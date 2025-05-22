"use client";
import LoginForm from "@/components/LoginForm";
import { useKeycloakContext } from "./context/KeycloakContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { keycloak, authenticated, loading } = useKeycloakContext();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  if (!authenticated) {
    return (
      <div>
        <h1>Zaloguj się</h1>
        <LoginForm />
        <button onClick={() => router.push("/register")}>Nie masz konta? Zarejestruj się</button>
        <button onClick={() => keycloak.login({ idpHint: "google" })}>Zaloguj przez Google</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Witaj, {keycloak.tokenParsed?.preferred_username}</h1>
      <button onClick={() => keycloak.logout()}>Wyloguj</button>
    </div>
  );
}