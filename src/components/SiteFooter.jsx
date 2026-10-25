import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Fold, Chevron } from './Fold';
import { Logo, BetkaMetka } from './Logo';
import { modeGroups, modePath } from '../data/textModes';

const toolLinks = [
  { to: '/photo-page', label: 'Фото: сжатие и обработка' },
  { to: '/kod-page', label: 'Перевод кода' },
  { to: '/file-page', label: 'Конвертация файлов' },
];

const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} onClick={toTop} className="footer-link">
        {children}
      </Link>
    </li>
  );
}

function FooterColumn({ title, open, onToggle, children }) {
  const id = useId();
  return (
    <div>
      <button
        type="button"
        className="footer-head"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
      >
        <span>{title}</span>
        <Chevron open={open} className="footer-chev" />
      </button>
      <Fold open={open}>
        <ul id={id}>{children}</ul>
      </Fold>
    </div>
  );
}

export function SiteFooter() {
  const [open, setOpen] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(
      () => footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
      420,
    );
    return () => clearTimeout(timer);
  }, [open]);

  const toggle = () => setOpen((value) => !value);

  return (
    <footer ref={footerRef} className="px-5 pb-5 pt-8">
      <div className="site-footer">
        <div className="site-footer-brand">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8" />
            <BetkaMetka />
          </div>
          <p>Бесплатный ИИ-сервис: тексты, перевод кода, сжатие фото и конвертация файлов. Без регистрации.</p>
        </div>
        <nav className="site-footer-grid" aria-label="Все разделы">
          {modeGroups.map((group) => (
            <FooterColumn key={group.label} title={group.label} open={open} onToggle={toggle}>
              {group.options.map((option) => (
                <FooterLink key={option.value} to={modePath(option.value)}>
                  {option.label}
                </FooterLink>
              ))}
            </FooterColumn>
          ))}
          <FooterColumn title="Инструменты" open={open} onToggle={toggle}>
            {toolLinks.map((item) => (
              <FooterLink key={item.to} to={item.to}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </nav>
        <div className="site-footer-bottom">
          <span>© 2026 Kirka</span>
          <Link to="/privacy" onClick={toTop} className="footer-link">
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}
