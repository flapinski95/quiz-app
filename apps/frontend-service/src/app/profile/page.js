'use client';

import { useEffect, useState } from 'react';
import { useKeycloakContext } from '@/context/KeycloakContext';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field } from 'formik';
import styles from '../page.module.css';
import api from '../../lib/axios';
import Header from '@/components/Header';

export default function UserProfilePage() {
  const { keycloak, authenticated, loading } = useKeycloakContext();
  const [profile, setProfile] = useState(null);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      const timeout = setTimeout(() => router.push('/'), 500);
      return () => clearTimeout(timeout);
    }
  }, [authenticated, loading]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/me', {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Błąd pobierania profilu:', err);
      }
    };
    if (authenticated) fetchProfile();
  }, [authenticated]);

  useEffect(() => {
    const fetchUserQuizzes = async () => {
      try {
        const res = await api.get('/api/quizzes/my-quizzes', {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        });
        setUserQuizzes(res.data.quizzes || res.data);
      } catch (err) {
        console.error('Błąd pobierania quizów:', err);
      }
    };
    if (authenticated) fetchUserQuizzes();
  }, [authenticated]);

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Na pewno chcesz usunąć ten quiz?')) return;
    try {
      await api.delete(`/api/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      setUserQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      console.error('Błąd usuwania quizu:', err);
      alert('Nie udało się usunąć quizu.');
    }
  };

  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      const res = await api.put(
        '/api/users/me',
        { bio: values.bio },
        {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        }
      );
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Błąd aktualizacji profilu:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !authenticated || !profile) return <p className={styles.loading}>Ładowanie...</p>;

  const username = profile.username || keycloak.tokenParsed?.preferred_username || 'Nieznany';

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Twój profil</h1>
        <div className={styles.card}>
          <p>
            <strong>Nazwa użytkownika:</strong> {username}
          </p>
          <p>
            <strong>Bio:</strong> {profile.bio || 'Brak opisu'}
          </p>
          <p>
            <strong>Średni wynik:</strong> {profile.averageScore.toFixed(2)}
          </p>
          <p>
            <strong>Łączny wynik:</strong> {profile.totalScore}
          </p>
          <p>
            <strong>Rozegrane quizy:</strong> {profile.totalQuizzesPlayed}
          </p>

          {!isEditing ? (
            <div style={{ marginTop: '1rem' }}>
              <button className={styles.submitBtn} onClick={() => setIsEditing(true)}>
                Edytuj Bio
              </button>
              <button
                className={styles.submitBtn}
                onClick={() =>
                  window.open('http://localhost/auth/realms/quiz-app/account', '_blank')
                }
              >
                Zarządzaj kontem
              </button>
              <button className={styles.submitBtn} onClick={() => keycloak.logout()}>
                Wyloguj
              </button>
            </div>
          ) : (
            <Formik initialValues={{ bio: profile.bio || '' }} onSubmit={handleProfileUpdate}>
              {({ isSubmitting }) => (
                <Form className={styles.profileForm}>
                  <label>
                    Bio:
                    <Field type="text" name="bio" className={styles.input} />
                  </label>
                  <div style={{ marginTop: '1rem' }}>
                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                      {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
                    </button>
                    <button
                      type="button"
                      className={styles.submitBtn}
                      onClick={() => setIsEditing(false)}
                    >
                      Anuluj
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>

        <section className={styles.userQuizzes}>
          <h2 className={styles.subtitle}>Twoje quizy</h2>
          {userQuizzes.length === 0 ? (
            <p>Nie masz jeszcze żadnych quizów.</p>
          ) : (
            <div className={styles.grid}>
              {userQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className={styles.card}
                  onClick={() => router.push(`/play/${quiz._id}`)}
                >
                  <strong>{quiz.title}</strong>
                  <p>{quiz.category || 'Brak kategorii'}</p>
                  <button
                    className={styles.submitBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuiz(quiz._id);
                    }}
                  >
                    Usuń
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
