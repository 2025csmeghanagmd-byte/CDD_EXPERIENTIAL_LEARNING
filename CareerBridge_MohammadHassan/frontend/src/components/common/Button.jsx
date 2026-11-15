import React from 'react';

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #ef233c 0%, #b81428 100%)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
  },
  secondary: {
    background: 'rgba(24, 24, 27, 0.8)',
    color: '#e4e4e7',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(8px)',
  },
  outline: {
    background: 'transparent',
    color: '#ef233c',
    border: '1.5px solid #ef233c',
  },
  danger: {
    background: '#dc2626',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 0 16px rgba(220, 38, 38, 0.4)',
  },
  success: {
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
  },
};

const sizeStyles = {
  sm: { padding: '0.45rem 0.95rem', fontSize: '0.8rem', borderRadius: '8px' },
  md: { padding: '0.65rem 1.35rem', fontSize: '0.9rem', borderRadius: '10px' },
  lg: { padding: '0.85rem 1.85rem', fontSize: '1rem', borderRadius: '12px' },
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  style = {},
  className = '',
}) => {
  const [hovered, setHovered] = React.useState(false);

  const base = {
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow:
      hovered && !disabled && !loading
        ? variant === 'primary'
          ? '0 0 24px rgba(239, 35, 60, 0.6)'
          : '0 4px 16px rgba(0,0,0,0.4)'
        : variantStyles[variant]?.boxShadow || 'none',
    transform: hovered && !disabled && !loading ? 'translateY(-1px)' : 'none',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={base}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
