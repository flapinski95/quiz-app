'use client';
import QuestionForm from '../../components/QuestionForm';
const { useState } = require('react');
const QuizForm = require('../../components/QuizForm').default;

export default function CreateQuizPage() {
  const [questions, setQuestions] = useState([]);
  return (
    <main>
      <h1>Stwórz nowy quiz</h1>
      <QuizForm />
    </main>
  );
}
