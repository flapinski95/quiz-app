'use client';

import { useEffect, useState } from 'react';
import { useKeycloakContext } from '@/context/KeycloakContext';
import api from '@/lib/axios';
import styles from '../page.module.css';
import Header from '@/components/Header';

export default function AdminPage() {
  const { keycloak, authenticated, loading } = useKeycloakContext();
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];

  const [quizzes, setQuizzes] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [quizPage, setQuizPage] = useState(1);
  const [quizTotalPages, setQuizTotalPages] = useState(1);
  const QUIZ_LIMIT = 6;

  useEffect(() => {
    if (authenticated && roles.includes('admin')) {
      fetchAllUsers();
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated && roles.includes('admin')) {
      fetchAllQuizzes(quizPage);
    }
  }, [authenticated, quizPage]);

  const fetchAllQuizzes = async (page = 1) => {
    try {
      const res = await api.get(`/api/quizzes?page=${page}&limit=${QUIZ_LIMIT}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      setQuizzes(res.data.quizzes || []);
      setQuizPage(res.data.page || 1);
      setQuizTotalPages(Math.ceil(res.data.total / res.data.limit));
    } catch (err) {
      console.error('Błąd pobierania quizów:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/api/users/all', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Błąd pobierania użytkowników:', err);
    }
  };

  const deleteQuiz = async (id) => {
    if (!confirm('Usunąć ten quiz?')) return;
    try {
      await api.delete(`/api/quizzes/admin/${id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      fetchAllQuizzes(quizPage);
    } catch (err) {
      console.error('Błąd usuwania quizu:', err);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Usunąć użytkownika?')) return;
    try {
      await api.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      setUsers((prev) => prev.filter((u) => u.keycloakId !== id));
    } catch (err) {
      console.error('Błąd usuwania użytkownika:', err);
    }
  };

  const deleteComment = async (quizId, commentId) => {
    if (!confirm('Usunąć komentarz?')) return;
    try {
      await api.delete(`/api/quizzes/${quizId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      fetchAllQuizzes(quizPage);
    } catch (err) {
      console.error('Błąd usuwania komentarza:', err);
    }
  };

  if (loading || !authenticated) return <p className={styles.loading}>Ładowanie...</p>;
  if (!roles.includes('admin')) return <p className={styles.loading}>Brak dostępu</p>;

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Panel administratora</h1>

        <div className={styles.adminGrid}>
          {/* Quizy */}
          <section className={`${styles.adminSection} ${styles.adminColumn}`}>
            <h2>Quizy</h2>
            {quizzes.map((quiz) => (
              <div key={quiz._id} className={styles.card}>
                <strong>{quiz.title}</strong> <small>({quiz.category})</small>
                <div style={{ marginTop: '0.5rem' }}>
                  <button onClick={() => deleteQuiz(quiz._id)} className={styles.submitBtn}>
                    Usuń
                  </button>
                  <button onClick={() => setSelectedQuiz(quiz)} className={styles.submitBtn}>
                    Komentarze
                  </button>
                </div>
              </div>
            ))}
            {/* Paginacja */}
            <div style={{ marginTop: '1rem' }}>
              {Array.from({ length: quizTotalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.submitBtn} ${quizPage === i + 1 ? styles.activePage : ''}`}
                  onClick={() => setQuizPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </section>

          {/* Użytkownicy */}
          <section className={`${styles.adminSection} ${styles.adminColumn}`}>
            <h2>Użytkownicy</h2>
            {users
              .filter((user) => user.keycloakId !== keycloak.tokenParsed?.sub)
              .map((user) => (
                <div key={user.keycloakId} className={styles.card}>
                  <strong>{user.username}</strong> <small>({user.email})</small>
                  <button
                    onClick={() => deleteUser(user.keycloakId)}
                    className={styles.submitBtn}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Usuń
                  </button>
                </div>
              ))}
          </section>
        </div>

        {/* Komentarze */}
        {selectedQuiz && (
          <section className={styles.adminSection}>
            <h3>Komentarze: {selectedQuiz.title}</h3>
            {selectedQuiz.comments?.length > 0 ? (
              <ul className={styles.commentList}>
                {selectedQuiz.comments.map((comment) => (
                  <li key={comment._id}>
                    <strong>{comment.username}</strong>: {comment.text}
                    <button
                      className={styles.submitBtn}
                      onClick={() => deleteComment(selectedQuiz._id, comment._id)}
                    >
                      Usuń
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak komentarzy</p>
            )}
            <button onClick={() => setSelectedQuiz(null)} className={styles.submitBtn}>
              Zamknij
            </button>
          </section>
        )}
      </main>
    </div>
  );
}