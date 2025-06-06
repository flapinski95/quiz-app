'use client';

import { Formik, Form, Field } from 'formik';
import QuestionForm from './QuestionForm';
import api from '../lib/axios';
import { useKeycloakContext } from '@/context/KeycloakContext';

export default function QuizForm() {
  const { keycloak } = useKeycloakContext();

  const initialValues = {
    title: '',
    description: '',
    language: 'en',
    difficulty: 'medium',
    duration: 60,
    isPublic: true,
    category: '',
    tags: '',
    questions: [], // ← WAŻNE!
  };

  const handleSubmit = async (values) => {
    const quizData = {
      ...values,
      tags: values.tags.split(',').map(tag => tag.trim()),
    };

    try {
      await api.post('/api/quizzes', quizData, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      alert('Quiz utworzony!');
    } catch (err) {
      console.error('Błąd przy tworzeniu quizu', err);
      alert('Błąd');
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
          <h2>Quiz</h2>

          <label>Tytuł:</label>
          <Field name="title" placeholder="Tytuł" required />

          <label>Opis:</label>
          <Field name="description" placeholder="Opis" />

          <label>Kategoria:</label>
          <Field name="category" placeholder="Kategoria" />

          <label>Tagi (przecinki):</label>
          <Field name="tags" placeholder="tag1,tag2" />

          <label>Poziom trudności:</label>
          <Field as="select" name="difficulty">
            <option value="easy">Łatwy</option>
            <option value="medium">Średni</option>
            <option value="hard">Trudny</option>
          </Field>

          <label>Czas trwania (sekundy):</label>
          <Field name="duration" type="number" />

          <label>Prywatny:</label>
          <Field type="checkbox" name="isPublic" />

          <QuestionForm values={values} setFieldValue={setFieldValue} />

          <br />
          <button type="submit">Zapisz quiz</button>
        </Form>
      )}
    </Formik>
  );
}