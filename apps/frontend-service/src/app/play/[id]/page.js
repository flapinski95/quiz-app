'use client';
import { useKeycloakContext } from '@/context/KeycloakContext';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import QuizQuestion from '@/components/QuizQuestion';
import ResultSummary from '@/components/ResultSummary';
import api from '@/lib/axios';
import styles from '../../page.module.css';

export default function PlayQuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const { keycloak, authenticated, loading } = useKeycloakContext();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!loading && !authenticated) router.push('/');
  }, [authenticated, loading]);

  useEffect(() => {
    const load = async () => {
      try {
        const sessionRes = await api.post(
          `/api/sessions/start/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${keycloak.token}` },
          }
        );
        setSession(sessionRes.data);

        const questionsRes = await api.get(`/api/quizzes/${id}/questions`, {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        });
        setQuestions(questionsRes.data);
      } catch (err) {
        router.push('/');
      }
    };

    if (authenticated) load();
  }, [authenticated]);

  const handleSubmit = async () => {
    const question = questions[currentIndex];
    try {
      await api.post(
        `/api/sessions/${session._id}/answer`,
        {
          questionId: question._id,
          selectedAnswers: selected,
        },
        {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        }
      );

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelected([]);
      } else {
        const res = await api.post(
          `/api/sessions/${session._id}/finish`,
          {},
          {
            headers: { Authorization: `Bearer ${keycloak.token}` },
          }
        );
        setResult(res.data);
      }
    } catch (err) {
      console.error('Błąd zapisu odpowiedzi:', err);
    }
  };

  if (loading || !session || questions.length === 0)
    return <p className={styles.loading}>Ładowanie...</p>;
  if (result) return <ResultSummary result={result} />;

  return (
    <div className={styles.quizContainer}>
      <QuizQuestion
        question={questions[currentIndex]}
        selected={selected}
        onChange={setSelected}
        onSubmit={handleSubmit}
        index={currentIndex}
        total={questions.length}
      />
    </div>
  );
}
