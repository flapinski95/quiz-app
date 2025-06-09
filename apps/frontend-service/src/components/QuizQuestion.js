import styles from '../app/page.module.css';

export default function QuizQuestion({ question, selected, onChange, onSubmit, index, total }) {
  return (
    <div className={styles.card}>
      <h2>{question.text}</h2>
      <ul className={styles.answerList}>
        {question.options.map((ans, i) => (
          <li key={i}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(ans)}
                onChange={() =>
                  onChange(prev =>
                    prev.includes(ans) ? prev.filter(a => a !== ans) : [...prev, ans]
                  )
                }
              />
              {ans}
            </label>
          </li>
        ))}
      </ul>
      <button className={styles.submitBtn} onClick={onSubmit}>Zatwierdź</button>
      <p>Pytanie {index + 1} z {total}</p>
    </div>
  );
}