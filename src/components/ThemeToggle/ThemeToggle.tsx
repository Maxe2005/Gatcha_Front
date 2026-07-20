// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useBackgroundView } from '../../context/BackgroundViewContext';
import './ThemeToggle.css';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm10-8a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm13.66-7.66a1 1 0 0 1 0 1.42l-1.42 1.41a1 1 0 1 1-1.41-1.41l1.41-1.42a1 1 0 0 1 1.42 0zM7.17 16.83a1 1 0 0 1 0 1.42l-1.41 1.41a1 1 0 1 1-1.42-1.41l1.42-1.42a1 1 0 0 1 1.41 0zm11.49 1.42a1 1 0 0 1-1.42 0l-1.41-1.42a1 1 0 1 1 1.41-1.41l1.42 1.41a1 1 0 0 1 0 1.42zM7.17 7.17a1 1 0 0 1-1.41 0L4.34 5.76a1 1 0 1 1 1.42-1.42l1.41 1.42a1 1 0 0 1 0 1.41z" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M12.74 2.02a1 1 0 0 1 .27 1.1A8 8 0 0 0 21.9 13.98a1 1 0 0 1 1.4 1.2A10 10 0 1 1 11.62 2a1 1 0 0 1 1.12.02z" />
  </svg>
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { setIsHoldActive } = useBackgroundView();
  const [isRightHold, setIsRightHold] = useState(false);

  useEffect(() => {
    if (!isRightHold) return;

    const handleRelease = () => {
      setIsHoldActive(false);
      setIsRightHold(false);
    };

    window.addEventListener('mouseup', handleRelease);
    window.addEventListener('blur', handleRelease);

    return () => {
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('blur', handleRelease);
    };
  }, [isRightHold, setIsHoldActive]);

  const handleMouseDown = (event) => {
    if (event.button !== 2) return;
    event.preventDefault();
    setIsHoldActive(true);
    setIsRightHold(true);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      className="theme-toggle-btn"
      title={`${theme === 'dark' ? 'Mode Divin' : 'Mode Sombre'} - T: switch theme - Clic droit maintenu: voir le background`}
    >
      {theme === 'divine' || theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

export default ThemeToggle;
