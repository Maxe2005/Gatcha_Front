import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

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
