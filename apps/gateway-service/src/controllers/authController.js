// src/controllers/authController.js
const axios = require("axios");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    console.log("[1] Rejestracja - pobieranie tokena admina...");

    const tokenRes = await axios.post(
      "http://keycloak:8080/realms/master/protocol/openid-connect/token",
      new URLSearchParams({
        client_id: "admin-cli",
        grant_type: "password",
        username: "admin",
        password: "admin",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const serviceTokenRes = await axios.post(
      'http://keycloak:8080/realms/quiz-app/protocol/openid-connect/token',
      new URLSearchParams({
        client_id: 'user-service',
        client_secret: process.env.USER_SERVICE_SECRET,
        grant_type: 'client_credentials',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    const serviceToken = serviceTokenRes.data.access_token;

    const accessToken = tokenRes.data.access_token;
    console.log("[2] Token admina pobrany:", accessToken.substring(0, 20) + "...");

    console.log("[3] Tworzenie użytkownika w Keycloak...");
    await axios.post(
      "http://keycloak:8080/admin/realms/quiz-app/users",
      {
        username,
        email,
        enabled: true,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("[4] Użytkownik utworzony w Keycloak");

    console.log("[5] Pobieranie ID użytkownika...");
    const users = await axios.get(
      `http://keycloak:8080/admin/realms/quiz-app/users?username=${username}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const keycloakId = users.data[0].id;
    console.log("[6] ID użytkownika:", keycloakId);

    console.log("[7] Tworzenie użytkownika w user-service (PostgreSQL)...");
    await axios.post(
      "http://user-service:3002/api/users/sync",
      { keycloakId},
      {
        headers: {
          Authorization: `Bearer ${serviceToken}`, 
        },
      }
    );
    console.log("[8] Użytkownik zapisany w user-service");

    console.log("[9] Wysyłanie maila weryfikacyjnego...");
    await axios.put(
      `http://keycloak:8080/admin/realms/quiz-app/users/${keycloakId}/execute-actions-email`,
      ["VERIFY_EMAIL"],
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("[10] E-mail weryfikacyjny wysłany");

    res.status(201).json({ message: "Zarejestrowano użytkownika" });
  } catch (err) {
    console.error("❌ Błąd rejestracji:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error("Message:", err.message);
    }
    res.status(500).json({ message: "Rejestracja nieudana" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(`[LOGIN] Próba logowania: ${username}`);
    const tokenRes = await axios.post(
      "http://keycloak:8080/realms/quiz-app/protocol/openid-connect/token",
      new URLSearchParams({
        client_id: "frontend",
        grant_type: "password",
        username,
        password,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("[LOGIN] Użytkownik zalogowany pomyślnie");
    res.status(200).json({ ...tokenRes.data, username: username });
  } catch (err) {
    console.error("❌ Błąd logowania:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error("Message:", err.message);
    }
    res.status(401).json({ message: "Nieprawidłowe dane logowania" });
  }
};