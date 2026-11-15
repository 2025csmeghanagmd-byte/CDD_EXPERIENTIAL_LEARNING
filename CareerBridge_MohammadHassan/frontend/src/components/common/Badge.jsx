import React from 'react';

const badgeColors = {
  red: { bg: 'rgba(239, 35, 60, 0.15)', color: '#fca5a5', border: 'rgba(239, 35, 60, 0.35)' },
  blue: { bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.35)' },
  green: { bg: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: 'rgba(16, 185, 129, 0.35)' },
  yellow: { bg: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: 'rgba(234, 179, 8, 0.35)' },
  purple: { bg: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe', border: 'rgba(168, 85, 247, 0.35)' },
  teal: { bg: 'rgba(20, 184, 166, 0.15)', color: '#5eead4', border: 'rgba(20, 184, 166, 0.35)' },
  gray: { bg: 'rgba(255, 255, 255, 0.06)', color: '#a1a1aa', border: 'rgba(255, 255, 255, 0.12)' },
};

const Badge = ({ children, color = 'red', size = 'sm', style = {} }) => {
  const chosen = badgeColors[color] || badgeColors.red;
  const padding = size === 'sm' ? '0.2rem 0.65rem' : '0.35rem 0.85rem';
  const fontSize = size === 'sm' ? '0.75rem' : '0.85rem';

  return (
    <span
      style={{
        display: 'inline-block',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '20px',
        background: chosen.bg,
        color: chosen.color,
        border: `1px solid ${chosen.border}`,
        lineHeight: 1.2,
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
