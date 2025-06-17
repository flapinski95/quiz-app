'use client';

import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import api from '../lib/axios';
import { useKeycloakContext } from '@/context/KeycloakContext';
import QuestionForm from './QuestionForm';
import styles from '../app/page.module.css';

export default function QuizForm() {
  const { keycloak } = useKeycloakContext();
  const [createdQuizId, setCreatedQuizId] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);

  const initialValues = {
    title: '',
    description: '',
    language: 'en',
    difficulty: 'medium',
    duration: 60,
    isPublic: true,
    category: '',
    tags: '',
  };

  const handleQuizSubmit = async (values) => {
    const quizData = {
      ...values,
      tags: values.tags.split(',').map((tag) => tag.trim()),
    };

    try {
      const res = await api.post('/api/quizzes', quizData, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      setCreatedQuizId(res.data._id);
      alert('Quiz utworzony. Teraz dodaj pytania.');
    } catch (err) {
      console.error('Błąd przy tworzeniu quizu', err);
      alert('Błąd tworzenia quizu');
    }
  };

  const handleQuestionAdded = () => {
    setQuestionCount((prev) => prev + 1);
  };

  return (
    <div className={styles.container}>
      {!createdQuizId ? (
        <Formik initialValues={initialValues} onSubmit={handleQuizSubmit}>
          {() => (
            <Form className={styles.quizContainer}>
              <h2 className={styles.title}>Utwórz quiz</h2>

              <label>Tytuł:</label>
              <Field name="title" placeholder="Tytuł" className={styles.input} required />

              <label>Opis:</label>
              <Field name="description" placeholder="Opis" className={styles.input} />

              <label>Kategoria:</label>
              <Field name="category" placeholder="Kategoria" className={styles.input} />

              <label>Tagi (przecinki):</label>
              <Field name="tags" placeholder="tag1,tag2" className={styles.input} />

              <label>Poziom trudności:</label>
              <Field as="select" name="difficulty" className={styles.input}>
                <option value="easy">Łatwy</option>
                <option value="medium">Średni</option>
                <option value="hard">Trudny</option>
              </Field>

              <label>Czas trwania (sekundy):</label>
              <Field name="duration" type="number" className={styles.input} />

              <label>Prywatny:</label>
              <Field type="checkbox" name="isPublic" />

              <br />
              <button type="submit" className={styles.submitBtn}>
                Utwórz quiz
              </button>
            </Form>
          )}
        </Formik>
      ) : (
        <div className={styles.quizContainer}>
          <h3>Dodaj pytania do quizu</h3>
          <p>Dodanych pytań: {questionCount}</p>
          <QuestionForm
            quizId={createdQuizId}
            token={keycloak.token}
            onQuestionAdded={handleQuestionAdded}
          />
          <button
            onClick={() => (window.location.href = '/')}
            className={styles.logoutButton}
            style={{ marginTop: '20px' }}
          >
            Zakończ i wróć
          </button>
        </div>
      )}
    </div>
  );
}
