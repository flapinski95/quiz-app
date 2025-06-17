import styles from '../app/page.module.css';

export default function ResultSummary({ result }) {
  return (
    <div className={styles.resultBox}>
      <h2>Quiz zakończony!</h2>
      <p>
        <strong>Wynik:</strong> {result.totalScore} pkt
      </p>
      <p>
        <strong>Poprawne odpowiedzi:</strong> {result.correctAnswers} / {result.totalQuestions}
      </p>
      <button className={styles.submitBtn} onClick={() => (window.location.href = '/')}>
        Wróć do strony głównej
      </button>
    </div>
  );
}
