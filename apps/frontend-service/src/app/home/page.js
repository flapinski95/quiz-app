'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useKeycloakContext } from "@/context/KeycloakContext";
import Header from "@/components/Header";

export default function HomePage() {
  const { keycloak, authenticated, setAuthenticated, loading } = useKeycloakContext();
    const [authMethod, setAuthMethod] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/");
    }
  }, [authenticated, loading]);
  useEffect(() => {
    const method = localStorage.getItem("auth_method");
    setAuthMethod(method);
  }, [authenticated]);

  if (loading || !authenticated) return <p>Ładowanie...</p>;

  if (authMethod === "keycloak") {
    return (
      <div>
        <Header/>
        <h1>Witaj, {keycloak.tokenParsed?.preferred_username}</h1>
        <button onClick={() => keycloak.logout({redirectUri: "http://localhost:3000"})}>Wyloguj</button>
      </div>
    );
  }

  if (authMethod === "api") {
    const username = localStorage.getItem("username"); 
    return (
      <div>
        <Header/>
        <h1>Witaj, {username || "Użytkowniku"}!</h1>
        <button onClick={() => {
          localStorage.clear();
          setAuthenticated(false);
          router.push("/");
        }}>
          Wyloguj
        </button>
      </div>
    );
  }
}