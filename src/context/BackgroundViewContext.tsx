import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const BackgroundViewContext = createContext(null);

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

export const BackgroundViewProvider = ({ children }) => {
  const [isPinned, setIsPinned] = useState(false);
  const [isHoldActive, setIsHoldActive] = useState(false);

  const isActive = isPinned || isHoldActive;

  useEffect(() => {
    document.body.classList.toggle('background-view-active', isActive);
  }, [isActive]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isEditableTarget(event.target)) return;
      if (event.repeat) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.code === 'KeyB') {
        event.preventDefault();
        setIsPinned((prev) => !prev);
      }

      if (event.code === 'Escape' && isActive) {
        event.preventDefault();
        setIsPinned(false);
        setIsHoldActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  const value = useMemo(
    () => ({
      isActive,
      isPinned,
      setIsHoldActive,
      togglePinned: () => setIsPinned((prev) => !prev),
      setPinned: setIsPinned,
    }),
    [isActive, isPinned]
  );

  return (
    <BackgroundViewContext.Provider value={value}>
      {children}
    </BackgroundViewContext.Provider>
  );
};

export const useBackgroundView = () => {
  const context = useContext(BackgroundViewContext);
  if (!context) {
    throw new Error(
      'useBackgroundView must be used within a BackgroundViewProvider'
    );
  }
  return context;
};
