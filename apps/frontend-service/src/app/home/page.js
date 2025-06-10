'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useKeycloakContext } from "@/context/KeycloakContext";
import Header from "@/components/Header";
import styles from "../page.module.css";
import api from "@/lib/axios";
import Link from "next/link";

export default function HomePage() {
  const { keycloak, authenticated, setAuthenticated, loading } = useKeycloakContext();
  const [quizzes, setQuizzes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated && router.pathname !== "/") {
      router.push("/");
    }
  }, [authenticated, loading]);

  const fetchQuizzes = async (pageToFetch = 1) => {
    if (!keycloak.token) return;

    try {
      setLoadingQuizzes(true);
      const res = await api.get(`/api/quizzes?page=${pageToFetch}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      setQuizzes(Array.isArray(res.data.quizzes) ? res.data.quizzes : []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error('Błąd pobierania quizów:', err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    if (authenticated) fetchQuizzes(page);
  }, [authenticated]);

  const totalPages = Math.ceil(total / limit);

  if (loading || !authenticated || loadingQuizzes) return <p className={styles.loading}>Ładowanie...</p>;

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>
          Witaj, {keycloak.tokenParsed?.preferred_username || "Użytkowniku"}!
        </h1>
        <button
          className={styles.logoutButton}
          onClick={() => {
            keycloak.logout({ redirectUri: "http://quiz.localhost/" });
          }}
        >
          Wyloguj
        </button>

        <div className={styles.quizListContainer}>
          <h2>Dostępne Quizy</h2>
          {quizzes.length === 0 ? (
            <p>Brak dostępnych quizów.</p>
          ) : (
            <ul className={styles.quizList}>
              {quizzes.map((quiz) => (
                <li key={quiz._id} className={styles.quizItem}>
                  <Link href={`/play/${quiz._id}`}>
                    <div className={styles.quizLink}>
                      <strong>{quiz.title}</strong>
                      <p>{quiz.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.pagination}>
            <button
              onClick={() => {
                if (page > 1) fetchQuizzes(page - 1);
              }}
              disabled={page <= 1}
            >
              ◀ Poprzednia
            </button>
            <span>Strona {page} z {totalPages}</span>
            <button
              onClick={() => {
                if (page < totalPages) fetchQuizzes(page + 1);
              }}
              disabled={page >= totalPages}
            >
              Następna ▶
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}