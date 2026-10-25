import { useId, useState } from 'react';
import { Fold, Chevron } from './Fold';
import { modeByValue } from '../data/textModes';
import { textAbout } from '../data/textAbout';

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="about-faq-item">
      <h3>
        <button
          type="button"
          className="about-faq-q"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{q}</span>
          <Chevron open={open} />
        </button>
      </h3>
      <Fold open={open}>
        <p id={id} className="about-faq-a">
          {a}
        </p>
      </Fold>
    </div>
  );
}

export function AboutBlock({ mode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const about = textAbout[mode];
  const meta = modeByValue[mode];
  if (!about || !meta) return null;

  return (
    <section className="about-card" aria-label="О виде текста">
      <h1>
        <button
          type="button"
          className="about-head"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="about-head-text">
            <span className="about-kicker">Как это работает</span>
            <span className="about-title">{about.h1}</span>
          </span>
          <Chevron open={open} />
        </button>
      </h1>
      <Fold open={open}>
        <div id={id} className="about-body">
          <p className="about-intro">{about.intro}</p>
          <ul className="about-points">
            {meta.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="about-faq">
            {about.faq.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </Fold>
    </section>
  );
}
