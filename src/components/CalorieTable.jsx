import { useId, useMemo, useState } from 'react';
import { Fold, Chevron } from './Fold';
import { calorieSections } from '../data/calorieSections';

// Справочник калорийности: выпадающий блок, как «Как это работает».
// Содержимое всегда в DOM (Fold только сворачивает), а для поисковиков
// та же таблица есть в статическом HTML (scripts/generate-pages.mjs).
export function CalorieTable() {
  const sections = useMemo(() => calorieSections(), []);
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <section className="about-card" aria-label="Калорийность продуктов">
      <h2>
        <button
          type="button"
          className="about-head"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="about-head-text">
            <span className="about-kicker">Справочник</span>
            <span className="about-title">Калорийность продуктов на 100 г</span>
          </span>
          <Chevron open={open} />
        </button>
      </h2>
      <Fold open={open}>
        <div id={id} className="about-body">
          <p className="about-intro">Калории, белки, жиры и углеводы на 100 г. Значения примерные.</p>
          <div className="cal-list">
            {sections.map((section) => (
              <details key={section.id} className="cal-sec">
                <summary className="cal-sum">
                  <span>{section.label}</span>
                  <span className="cal-sum-end">
                    <span className="doc-num">{section.rows.length}</span>
                    <Chevron />
                  </span>
                </summary>
                <div className="doc-table-wrap cal-wrap">
                  <table className="cal-table">
                    <thead className="doc-table-head">
                      <tr>
                        <th>Продукт</th>
                        <th>Ккал</th>
                        <th>Б</th>
                        <th>Ж</th>
                        <th>У</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td>{row.kcal}</td>
                          <td>{row.p}</td>
                          <td>{row.f}</td>
                          <td>{row.c}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        </div>
      </Fold>
    </section>
  );
}
