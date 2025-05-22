// src/controllers/authController.js
const axios = require("axios");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
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

    const accessToken = tokenRes.data.access_token;

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

    res.status(201).json({ message: "Zarejestrowano" });
  } catch (err) {
    console.error("Błąd rejestracji:", err?.response?.data || err.message);
    res.status(500).json({ message: "Rejestracja nieudana" });
  }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
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
  
      res.status(200).json(tokenRes.data); 
    } catch (err) {
      console.error("Błąd logowania:", err?.response?.data || err.message);
      res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }
  };