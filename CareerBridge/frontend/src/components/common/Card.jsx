import React from 'react';

const baseStyles = {
  card: {
    background: 'rgba(14, 14, 18, 0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    padding: '1.5rem',
    color: '#f4f4f5',
    transition: 'all 0.25s ease',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#ffffff',
    fontFamily: "'Manrope', sans-serif",
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    letterSpacing: '-0.01em',
  },
};

const Card = ({ title, children, className = '', style = {}, hoverable = false }) => {
  const [hovered, setHovered] = React.useState(false);

  const cardStyle = {
    ...baseStyles.card,
    ...(hoverable && hovered
      ? {
          borderColor: 'rgba(239, 35, 60, 0.35)',
          boxShadow: '0 0 25px rgba(239, 35, 60, 0.15)',
          transform: 'translateY(-2px)',
        }
      : {}),
    ...style,
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
    >
      {title && <h3 style={baseStyles.title}>{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
