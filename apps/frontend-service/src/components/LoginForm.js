import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../lib/axios"; 

export default function LoginForm() {
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
        const res = await api.post("/api/auth/login", values);
        console.log("Zalogowano:", res.data);
        alert("Zalogowano!");
      } catch (err) {
        console.error("Błąd logowania:", err.response?.data || err.message);
        alert("Logowanie nieudane");
      }
    },
  });



  return (
    <form onSubmit={formik.handleSubmit}>
      <h2>Zaloguj się</h2>
      <input
        type="username"
        name="username"
        placeholder="Username"
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

      <button type="submit">Zaloguj</button>

      <hr />
      
    </form>
  );
}