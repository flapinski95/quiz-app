'use client';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from '../lib/axios';
import styles from '../app/page.module.css';

const questionTypes = ['single-choice', 'multiple-choice', 'true-false', 'open-ended'];

export default function QuestionForm({ quizId, token, onQuestionAdded }) {
  const initialValues = {
    text: '',
    type: 'single-choice',
    options: ['', '', '', ''],
    correctAnswers: [],
    points: 1,
    hint: '',
  };

  const validationSchema = Yup.object({
    text: Yup.string().required('Treść pytania jest wymagana'),
    type: Yup.string().required(),
    points: Yup.number().min(1).required(),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        ...values,
        quizId,
      };

      await api.post(`/api/quizzes/${quizId}/questions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Dodano pytanie!');
      resetForm();
      onQuestionAdded?.();
    } catch (err) {
      console.error('Błąd przy dodawaniu pytania', err);
      alert('Nie udało się dodać pytania');
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Form className={styles.quizContainer}>
          <h3 className={styles.title}>Dodaj pytanie</h3>

          <label>Treść pytania:</label>
          <Field name="text" placeholder="Pytanie" className={styles.input} />

          <label>Typ pytania:</label>
          <Field as="select" name="type" className={styles.input}>
            {questionTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Field>

          {(values.type === 'single-choice' || values.type === 'multiple-choice') && (
            <>
              <label>Opcje odpowiedzi:</label>
              {values.options.map((_, i) => (
                <Field
                  key={i}
                  name={`options[${i}]`}
                  placeholder={`Opcja ${i + 1}`}
                  className={styles.input}
                />
              ))}

              <label>Poprawne odpowiedzi (oddzielone przecinkami):</label>
              <Field
                name="correctAnswers"
                placeholder="np. Opcja 1, Opcja 2"
                className={styles.input}
              />
            </>
          )}

          {values.type === 'true-false' && (
            <>
              <label>Poprawna odpowiedź:</label>
              <Field as="select" name="correctAnswers" className={styles.input}>
                <option value="">-- wybierz --</option>
                <option value="Prawda">Prawda</option>
                <option value="Fałsz">Fałsz</option>
              </Field>
            </>
          )}

          {values.type === 'open-ended' && (
            <>
              <label>Poprawna odpowiedź (tekstowa):</label>
              <Field name="correctAnswers" placeholder="np. 42" className={styles.input} />
            </>
          )}

          <label>Punktacja:</label>
          <Field type="number" name="points" className={styles.input} />

          <label>Podpowiedź (opcjonalnie):</label>
          <Field name="hint" placeholder="Podpowiedź" className={styles.input} />

          <button type="submit" className={styles.submitBtn}>
            Dodaj pytanie
          </button>
        </Form>
      )}
    </Formik>
  );
}
