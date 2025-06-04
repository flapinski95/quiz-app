"use client";
import { useState } from 'react';
import api from '../lib/axios'; 

export default function QuizForm() {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    language: 'en',
    difficulty: 'medium',
    duration: 60,
    isPublic: true,
    category: '',
    tags: [],
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'single-choice',
    options: ['', '', '', ''],
    correctAnswers: [],
    points: 1,
    hint: '',
  });

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (e, idx = null) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const newOptions = [...currentQuestion.options];
      newOptions[idx] = value;
      setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
    } else {
      setCurrentQuestion((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, currentQuestion]);
    setCurrentQuestion({
      text: '',
      type: 'single-choice',
      options: ['', '', '', ''],
      correctAnswers: [],
      points: 1,
      hint: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quizRes = await api.post('/api/quizzes', quizData);
      const quizId = quizRes.data._id;

      for (const q of questions) {
        await api.post(`/api/quizzes/${quizId}/questions`, q);
      }

      alert('Quiz utworzony!');
    } catch (err) {
      console.error(err);
      alert('Błąd przy tworzeniu quizu');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nowy Quiz</h2>

      <input name="title" placeholder="Tytuł" value={quizData.title} onChange={handleQuizChange} required />
      <textarea name="description" placeholder="Opis" value={quizData.description} onChange={handleQuizChange} />
      <input name="category" placeholder="Kategoria" value={quizData.category} onChange={handleQuizChange} />
      <input name="tags" placeholder="Tagi (przecinki)" value={quizData.tags.join(',')} onChange={(e) => setQuizData((prev) => ({ ...prev, tags: e.target.value.split(',') }))} />

      <select name="difficulty" value={quizData.difficulty} onChange={handleQuizChange}>
        <option value="easy">Łatwy</option>
        <option value="medium">Średni</option>
        <option value="hard">Trudny</option>
      </select>

      <input name="duration" type="number" placeholder="Czas trwania (sekundy)" value={quizData.duration} onChange={handleQuizChange} />

      <h3>Dodaj pytanie</h3>
      <input name="text" placeholder="Treść pytania" value={currentQuestion.text} onChange={handleQuestionChange} />

      {currentQuestion.options.map((opt, idx) => (
        <input
          key={idx}
          name={`option${idx}`}
          placeholder={`Opcja ${idx + 1}`}
          value={opt}
          onChange={(e) => handleQuestionChange(e, idx)}
        />
      ))}

      <input
        name="correctAnswers"
        placeholder="Poprawne odpowiedzi (indeksy lub teksty, przecinki)"
        value={currentQuestion.correctAnswers.join(',')}
        onChange={(e) => setCurrentQuestion((prev) => ({
          ...prev,
          correctAnswers: e.target.value.split(','),
        }))}
      />

      <input
        name="points"
        type="number"
        placeholder="Punkty"
        value={currentQuestion.points}
        onChange={handleQuestionChange}
      />

      <input name="hint" placeholder="Podpowiedź" value={currentQuestion.hint} onChange={handleQuestionChange} />

      <button type="button" onClick={addQuestion}>➕ Dodaj pytanie</button>

      <br />
      <button type="submit">Utwórz Quiz</button>
    </form>
  );
}