// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const isEditableTarget = (target) => {
  if (!target) return false;
  const tagName = target.tagName;
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
};

export const ThemeProvider = ({ children }) => {
  // Get theme from localStorage or default to 'divine'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'divine';
  });

  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    // Also update body class for CSS compatibility
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-divine');
    } else {
      document.body.classList.add('theme-divine');
      document.body.classList.remove('theme-dark');
    }

    // Émettre un événement personnalisé pour notifier les systèmes qui écoutent
    window.dispatchEvent(
      new CustomEvent('themeChanged', { detail: { theme } })
    );
  }, [theme]);

  // Keyboard shortcut: T to toggle theme
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isEditableTarget(event.target)) return;
      if (event.repeat) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.code === 'KeyT') {
        event.preventDefault();
        setTheme((prevTheme) => (prevTheme === 'divine' ? 'dark' : 'divine'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'divine' ? 'dark' : 'divine'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
