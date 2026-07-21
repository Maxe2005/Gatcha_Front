// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import './Portal.css';

const Portal = ({ onInvoke, isLoading = false, transitioning = false }) => {
  const { theme } = useTheme();
  const [state, setState] = useState('idle'); // idle, hover, activating, active
  const portalRef = useRef(null);
  const hoverTimestampRef = useRef(null);
  const transitionDuration = 2.0;

  const handleMouseEnter = () => {
    if (!isLoading) {
      setState('hover');
      hoverTimestampRef.current = Date.now();
    }
  };

  const handleMouseLeave = () => {
    if (!isLoading && state === 'hover') {
      setState('idle');
      hoverTimestampRef.current = null;
    }
  };

  const handleClick = () => {
    if (
      !isLoading &&
      !transitioning &&
      state !== 'activating' &&
      state !== 'active'
    ) {
      setState('activating');
      setTimeout(() => {
        setState('active');
        if (onInvoke) onInvoke();
        setTimeout(() => {
          setState('idle');
        }, 1200);
      }, 600);
    }
  };

  // Animation configs pour Framer Motion
  const glyphRotationVariants: Variants = {
    idle: {
      rotate: [0, 360],
      transition: { duration: 12, repeat: Infinity, ease: 'linear' },
    },
    hover: {
      rotate: [0, 360],
      transition: { duration: 8, repeat: Infinity, ease: 'linear' },
    },
    activating: {
      rotate: [0, 360],
      transition: { duration: 2.2, repeat: Infinity, ease: 'linear' },
    },
  };

  const ringVariants: Variants = {
    idle: {
      scale: [1, 1.02, 1],
      rotate: [0, -5, 0],
      opacity: 1,
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
    hover: {
      scale: [1.03, 1.06, 1.03],
      rotate: [-10, 5, -10],
      opacity: 1,
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    activating: {
      scale: 1.15,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    hidden: {
      opacity: 0,
      transition: { duration: 0.1 },
    },
  };

  const vortexVariants: Variants = {
    idle: {
      rotate: [0, -360],
      transition: { duration: 8, repeat: Infinity, ease: 'linear' },
    },
    hover: {
      rotate: [0, -360],
      transition: { duration: 5, repeat: Infinity, ease: 'linear' },
    },
    activating: {
      rotate: [0, -360],
      transition: { duration: 2, repeat: Infinity, ease: 'linear' },
    },
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {transitioning && (
            <motion.div
              className="portal-warp-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {/* Ring - Grandit au premier plan */}
              <motion.div
                className={`portal-warp-ring ${theme}`}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 20, opacity: 0.8 }}
                transition={{ duration: transitionDuration, ease: 'linear' }}
              >
                <img
                  src={`/assets/portail/Anneau_portail_${theme}.webp`}
                  alt="Ring"
                  className="warp-ring-image"
                />
              </motion.div>

              {/* Vortex - Grandit + tourne */}
              <motion.div
                className={`portal-warp-vortex ${theme}`}
                initial={{ scale: 1, rotate: 0, opacity: 1 }}
                animate={{ scale: 22, rotate: -720, opacity: 0.85 }}
                transition={{ duration: transitionDuration, ease: 'linear' }}
              >
                <img
                  src={`/assets/portail/Vortex_portail_${theme}.webp`}
                  alt="Vortex"
                  className="warp-vortex-image"
                />
              </motion.div>

              {/* White/Dark Flash */}
              <motion.div
                className={`portal-warp-flash ${theme}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1] }}
                transition={{
                  duration: transitionDuration * 0.7,
                  times: [0, 0.8, 1],
                  ease: 'linear',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div
        ref={portalRef}
        className={`portal-container ${theme} ${state}`}
        role="button"
        tabIndex={0}
        aria-label="Portal d'invocation - Cliquez pour invoquer"
      >
        {/* COUCHE D : Noyau / Vortex */}
        <div className="portal-layer vortex-layer">
          <motion.div
            className={`vortex vortex-${theme}`}
            animate={state}
            variants={vortexVariants}
          >
            <img
              src={`/assets/portail/Vortex_portail_${theme}.webp`}
              alt="Vortex"
              className="vortex-image"
            />
            <div className="vortex-glow"></div>
            {state === 'activating' && <div className="vortex-pulse"></div>}
          </motion.div>
        </div>

        {/* COUCHE B : Glyphes & Runes */}
        <div className="portal-layer glyphes-layer">
          <motion.div
            className={`glyphes-container glyphes-${theme}`}
            animate={state}
            variants={glyphRotationVariants}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div
                key={`glyph-${index}`}
                className="glyph"
                style={
                  {
                    '--glyph-index': index,
                    transform: `rotate(calc(var(--glyph-index) * 45deg))`,
                  } as React.CSSProperties
                }
              >
                <div className="glyph-inner">
                  <img
                    src={`/assets/portail/glyphes/${theme}/Glyphes_${theme}_${index + 1}.webp`}
                    alt={`Glyphe ${index + 1}`}
                    className="glyph-image"
                  />
                  {state !== 'idle' && <div className="glyph-glow"></div>}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* COUCHE A : Anneau externe */}
        <div
          className="portal-layer ring-layer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <motion.div
            className={`ring ring-${theme}`}
            animate={transitioning ? 'hidden' : state}
            variants={ringVariants}
          >
            <img
              src={`/assets/portail/Anneau_portail_${theme}.webp`}
              alt="Anneau du portail"
              className="ring-image"
            />
            {state === 'activating' && <div className="ring-flash"></div>}
          </motion.div>
        </div>

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="portal-loading">
            <div className="loading-ring"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default Portal;
