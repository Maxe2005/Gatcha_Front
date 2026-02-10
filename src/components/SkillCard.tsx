import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './SkillCard.css';

const SkillCard = ({ skill }) => {
  const { theme } = useTheme();

  if (!skill) return null;

  // Determine skill type icon/color based on mock types if needed
  // Defaulting to a generic skill layout

  return (
    <div className={`skill-card ${theme}`}>
      <div className="skill-icon-container">
        {skill.icon ? (
          <img src={skill.icon} alt={skill.name} className="skill-icon" />
        ) : (
          <div className="skill-icon-placeholder">
            <span>⚡</span>
          </div>
        )}
      </div>
      <div className="skill-info">
        <div className="skill-header">
          <h4 className="skill-name">{skill.name}</h4>
          {skill.cost && <span className="skill-cost">{skill.cost} MP</span>}
        </div>
        <p className="skill-description">{skill.description}</p>
        {skill.cooldown && (
          <div className="skill-footer">
            <span className="skill-cd">CD: {skill.cooldown}s</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillCard;
