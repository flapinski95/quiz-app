import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../lib/axios"; 
import { useRouter } from "next/navigation";
import { useKeycloakContext } from "@/context/KeycloakContext";

export default function LoginForm() {
  const { keycloak, authenticated, loading, setAuthenticated } = useKeycloakContext();
  const router = useRouter()
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Wymagane"),
      password: Yup.string().required("Wymagane"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await api.post("/api/auth/login", values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Zalogowano:", res.data);
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("auth_method", "api");
        localStorage.setItem("username", res.data.username); 
        setAuthenticated(true);
        router.push("/home"); 
      } catch (err) {
        console.error("Błąd logowania:", err.response?.data || err.message);
        alert("Logowanie nieudane");
      }
    },
  });



  return (
    <form onSubmit={formik.handleSubmit}>
      <input
        type="username"
        name="username"
        placeholder="Username"
        onChange={formik.handleChange}
        value={formik.values.username}
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

      <button type="submit">Zaloguj</button>

      <hr />
      
    </form>
  );
}