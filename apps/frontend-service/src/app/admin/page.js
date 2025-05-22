"use client";
import { useKeycloakInit } from "../../hooks/useKeycloak";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { keycloak, isAuthenticated } = useKeycloakInit();
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];

  if (!isAuthenticated || !roles.includes("admin")) {
    return <p>Dostęp zabroniony</p>;
  }

  return <h1>Panel administratora</h1>;
}