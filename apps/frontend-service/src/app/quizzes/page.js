'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../page.module.css';
import { useKeycloakContext } from '@/context/KeycloakContext';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const { keycloak, authenticated, loading } = useKeycloakContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      const timeout = setTimeout(() => {
        router.push('/');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [authenticated, loading]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!keycloak.token) return;

      try {
        const res = await api.get('/api/quizzes', {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });
        setQuizzes(res.data);
      } catch (err) {
        console.error('Błąd pobierania quizów:', err);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    if (authenticated) {
      fetchQuizzes();
    }
  }, [authenticated]);

  if (loading || loadingQuizzes) return <div className="loading">Ładowanie quizów...</div>;

  return (
    <div className={styles.quizListContainer}>
      <h1>Dostępne Quizy</h1>
      {quizzes.length === 0 ? (
        <p>Brak dostępnych quizów.</p>
      ) : (
        <ul className="quiz-list">
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
    </div>
  );
}