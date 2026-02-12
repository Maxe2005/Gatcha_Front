import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useBackgroundView } from '../context/BackgroundViewContext';
import { IconButton } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import './ThemeToggle.css';

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
    <IconButton
      onClick={toggleTheme}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      className="theme-toggle-btn"
      title={`${theme === 'dark' ? 'Mode Divin' : 'Mode Sombre'} - T: switch theme - Clic droit maintenu: voir le background`}
    >
      {theme === 'divine' || theme === 'light' ? <DarkMode /> : <LightMode />}
    </IconButton>
  );
};

export default ThemeToggle;
