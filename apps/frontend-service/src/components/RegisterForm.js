"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import api from "../lib/axios"; 

export default function RegisterForm() {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      username: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Nieprawidłowy e-mail").required("Wymagane"),
      password: Yup.string().min(6, "Minimum 6 znaków").required("Wymagane"),
      username: Yup.string().required("Wymagane"),
    }),

    onSubmit: async (values) => {
      try {
        const response = await api.post("/api/auth/register", values);
        alert("Zarejestrowano!");
      } catch (err) {
        console.error("Błąd rejestracji:", err.response?.data || err.message);
        alert("Rejestracja nieudana: " + (err.response?.data?.message || "Nieznany błąd"));
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <h2>Załóż konto</h2>

      <input
        type="text"
        name="username"
        placeholder="Nazwa użytkownika"
        onChange={formik.handleChange}
        value={formik.values.username}
      />
      {formik.touched.username && formik.errors.username && <div>{formik.errors.username}</div>}

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={formik.handleChange}
        value={formik.values.email}
      />
      {formik.touched.email && formik.errors.email && <div>{formik.errors.email}</div>}

      <input
        type="password"
        name="password"
        placeholder="Hasło"
        onChange={formik.handleChange}
        value={formik.values.password}
      />
      {formik.touched.password && formik.errors.password && <div>{formik.errors.password}</div>}

      <button type="submit">Zarejestruj</button>
    </form>
  );
}