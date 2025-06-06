// components/QuestionForm.js
import { Field, FieldArray } from 'formik';

export default function QuestionForm({ values, setFieldValue }) {
  return (
    <FieldArray name="questions">
      {({ push, remove }) => (
        <div>
          <h3>Dodaj pytania</h3>
          {values.questions.map((q, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <label>Treść pytania:</label>
              <Field name={`questions.${idx}.text`} placeholder="Wpisz pytanie" required />

              <label>Typ pytania:</label>
              <Field as="select" name={`questions.${idx}.type`}>
                <option value="single-choice">Jednokrotny wybór</option>
                <option value="multiple-choice">Wielokrotny wybór</option>
                <option value="true-false">Prawda/Fałsz</option>
                <option value="open">Pytanie otwarte</option>
              </Field>

              <FieldArray name={`questions.${idx}.options`}>
                {({ push: pushOpt, remove: removeOpt }) => (
                  <div>
                    <label>Opcje:</label>
                    {q.options.map((opt, i) => (
                      <div key={i}>
                        <Field name={`questions.${idx}.options.${i}`} placeholder={`Opcja ${i + 1}`} />
                        {q.type === 'multiple-choice' && (
                          <label style={{ marginLeft: '8px' }}>
                            <input
                              type="checkbox"
                              checked={q.correctAnswers.includes(opt)}
                              onChange={() => {
                                const updated = q.correctAnswers.includes(opt)
                                  ? q.correctAnswers.filter((v) => v !== opt)
                                  : [...q.correctAnswers, opt];
                                setFieldValue(`questions.${idx}.correctAnswers`, updated);
                              }}
                            /> Poprawna
                          </label>
                        )}
                        <button type="button" onClick={() => removeOpt(i)}>Usuń opcję</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => pushOpt('')}>Dodaj opcję</button>
                  </div>
                )}
              </FieldArray>

              <label>Punkty:</label>
              <Field name={`questions.${idx}.points`} type="number" />

              <label>Podpowiedź:</label>
              <Field name={`questions.${idx}.hint`} />

              <button type="button" onClick={() => remove(idx)}>Usuń pytanie</button>
            </div>
          ))}

          <button type="button" onClick={() => push({
            text: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswers: [], points: 1, hint: ''
          })}>
            ➕ Dodaj pytanie
          </button>
        </div>
      )}
    </FieldArray>
  );
}