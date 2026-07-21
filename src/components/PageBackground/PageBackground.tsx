import React from 'react';

interface PageBackgroundProps {
  theme: string;
  className?: string;
  rayCount?: number;
  showFogEffects?: boolean;
  showScenery?: boolean;
}

/**
 * Fond ciel/nuages/rayons(divine)/brume(dark) partagé par Home, Inventory
 * et Profile. Chaque page garde ses propres variations via props plutôt
 * que de dupliquer la structure JSX.
 */
const PageBackground = ({
  theme,
  className = '',
  rayCount = 2,
  showFogEffects = true,
  showScenery = false,
}: PageBackgroundProps) => {
  return (
    <div className={`background-layer ${className}`.trim()}>
      <div className="sky-gradient" />
      <div className="clouds-layer" />
      {showFogEffects &&
        (theme === 'divine' ? (
          <div className="divine-rays">
            {Array.from({ length: rayCount }, (_, i) => (
              <div key={i} className={`ray r${i + 1}`} />
            ))}
          </div>
        ) : (
          <div className="dark-fog">
            <div className="fog f1" />
            <div className="fog f2" />
            <div className="embers" />
          </div>
        ))}
      {showScenery && (
        <>
          <div className="scenery scenery-left" />
          <div className="scenery scenery-right" />
        </>
      )}
    </div>
  );
};

export default PageBackground;
