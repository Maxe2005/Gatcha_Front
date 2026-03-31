import React, { useRef, useCallback, useLayoutEffect } from 'react';

// Composant pour les inputs/textareas avec largeur et hauteur adaptées dynamiquement
export const DynamicField = ({ type, value, onChange }) => {
  const fieldRef = useRef(null);

  // Déterminer si c'est un texte long (contient \n ou > 100 caractères)
  const isLongText =
    typeof value === 'string' && (value.includes('\n') || value.length > 100);
  const fieldType =
    type === 'number' ? 'number' : isLongText ? 'textarea' : 'text';

  // Fonction optimisée pour ajuster la taille
  const adjustSize = useCallback(() => {
    if (!fieldRef.current) return;

    if (fieldType === 'textarea') {
      // Pour textarea: réinitialiser puis ajuster la hauteur au contenu
      fieldRef.current.style.height = 'auto';
      const scrollHeight = fieldRef.current.scrollHeight;
      fieldRef.current.style.height = `${scrollHeight}px`;
    } else if (fieldType === 'text') {
      // Pour input: réinitialiser puis ajuster la largeur au contenu
      fieldRef.current.style.width = 'auto';
      // Petite temporisation pour permettre au DOM de recalculer scrollWidth
      requestAnimationFrame(() => {
        if (fieldRef.current) {
          const scrollWidth = fieldRef.current.scrollWidth;
          fieldRef.current.style.width = `${Math.max(scrollWidth + 4, 40)}px`;
        }
      });
    }
  }, [fieldType]);

  // Initialiser la taille au mount et changement de fieldType
  useLayoutEffect(() => {
    adjustSize();
  }, [fieldType, adjustSize]);

  const handleChange = (e) => {
    onChange(e);
    // Ajuster immédiatement
    adjustSize();
  };

  if (fieldType === 'textarea') {
    return (
      <textarea
        ref={fieldRef}
        value={value}
        onChange={handleChange}
        style={{
          width: '100%',
          minHeight: '60px',
          maxHeight: '400px',
          boxSizing: 'border-box',
          padding: '4px 6px',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          resize: 'none',
          overflow: 'hidden',
          transition: 'height 0.05s ease-out',
        }}
      />
    );
  }

  return (
    <input
      ref={fieldRef}
      type={fieldType}
      value={value}
      onChange={handleChange}
      style={{
        minWidth: '40px',
        boxSizing: 'border-box',
        padding: '2px 4px',
        transition: 'width 0.05s ease-out',
      }}
    />
  );
};
