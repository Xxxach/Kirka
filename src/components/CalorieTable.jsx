import { useMemo } from 'react';
import { calorieSections } from '../data/calorieSections';

export function CalorieTable() {
  const sections = useMemo(() => calorieSections(), []);
  return (
    <section className="doc-card" aria-label="Калорийность продуктов">
      <div>
        <span className="doc-kicker">Справочник</span>
        <h2 className="doc-title">Калорийность продуктов на 100 г</h2>
        <p className="doc-meta">Калории, белки, жиры и углеводы. Значения примерные.</p>
      </div>
      <div className="flex flex-col gap-2">
        {sections.map((section) => (
          <details key={section.id} className="group rounded-2xl border border-[#7A2432]/14 bg-white/50 px-4 py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-semibold text-slate-800">
              <span>{section.label}</span>
              <span className="doc-num">{section.rows.length}</span>
            </summary>
            <div className="doc-table-wrap mb-3">
              <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
                <thead className="doc-table-head">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Продукт</th>
                    <th className="px-2 py-2 text-right font-semibold">Ккал</th>
                    <th className="px-2 py-2 text-right font-semibold">Б</th>
                    <th className="px-2 py-2 text-right font-semibold">Ж</th>
                    <th className="px-4 py-2 text-right font-semibold">У</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7A2432]/10 text-slate-600">
                  {section.rows.map((row) => (
                    <tr key={row.name}>
                      <td className="px-4 py-2">{row.name}</td>
                      <td className="px-2 py-2 text-right font-medium text-slate-800">{row.kcal}</td>
                      <td className="px-2 py-2 text-right">{row.p}</td>
                      <td className="px-2 py-2 text-right">{row.f}</td>
                      <td className="px-4 py-2 text-right">{row.c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
