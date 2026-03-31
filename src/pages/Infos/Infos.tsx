import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Infos.css';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { useNavigate } from 'react-router-dom';

function slugify(text: any) {
  if (Array.isArray(text)) text = text.join('');
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export default function Infos() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [md, setMd] = useState('');
  const [headings, setHeadings] = useState<
    {
      text: string;
      level: number;
      id: string;
    }[]
  >([]);

  useEffect(() => {
    fetch('/docs/APP_DOC.md')
      .then((r) => r.text())
      .then((text) => {
        setMd(text);
        const re = /^(#{1,6})\s+(.*)$/gm;
        const hs: { text: string; level: number; id: string }[] = [];
        let m;
        while ((m = re.exec(text)) !== null) {
          const level = m[1].length;
          const title = m[2].trim();
          hs.push({ text: title, level, id: slugify(title) });
        }
        setHeadings(hs);
      })
      .catch(() =>
        setMd(`# Documentation

  Impossible de charger le fichier de documentation.`)
      );
  }, []);

  const onClickHeading = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const Heading =
    (Tag: string) =>
    ({ children }: { children: any }) => {
      const text = Array.isArray(children) ? children.join('') : children;
      const id = slugify(text);
      // @ts-ignore
      return React.createElement(Tag, { id }, children);
    };

  return (
    <div className={`infos-page ${theme}`}>
      <header className="infos-header glass-panel">
        <div className="infos-header-left">
          <button className="nav-back-btn" onClick={() => navigate('/profile')}>
            ← Profil
          </button>
          <button className="nav-back-btn" onClick={() => navigate('/home')}>
            🏠 Accueil
          </button>
        </div>
        <h1 className="infos-title">Documentation</h1>
        <div className="infos-header-right">
          <ThemeToggle />
        </div>
      </header>
      <div className="infos-root">
        <aside className="infos-sidebar glass-panel">
          <div className="infos-sidebar-title">Sections</div>
          <nav>
            {headings.map((h, i) => (
              <a
                key={i}
                href={`#${h.id}`}
                className={`infos-link lvl-${h.level}`}
                onClick={onClickHeading(h.id)}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
        <main className="infos-content">
          <article className="infos-article glass-panel">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: Heading('h1'),
                h2: Heading('h2'),
                h3: Heading('h3'),
                h4: Heading('h4'),
                h5: Heading('h5'),
                h6: Heading('h6'),
              }}
            >
              {md}
            </ReactMarkdown>
          </article>
        </main>
      </div>
    </div>
  );
}
