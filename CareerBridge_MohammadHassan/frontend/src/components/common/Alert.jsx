import React from 'react';

const alertStyles = {
  info: {
    background: 'rgba(59, 130, 246, 0.12)',
    color: '#93c5fd',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    icon: 'ℹ️',
  },
  success: {
    background: 'rgba(16, 185, 129, 0.12)',
    color: '#6ee7b7',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    icon: '✅',
  },
  warning: {
    background: 'rgba(234, 179, 8, 0.12)',
    color: '#fde047',
    border: '1px solid rgba(234, 179, 8, 0.3)',
    icon: '⚠️',
  },
  error: {
    background: 'rgba(239, 35, 60, 0.12)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 35, 60, 0.3)',
    icon: '❌',
  },
};

const Alert = ({ type = 'info', message, children, onClose, style = {} }) => {
  const current = alertStyles[type] || alertStyles.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.9rem 1.25rem',
        borderRadius: '12px',
        fontSize: '0.88rem',
        fontWeight: 500,
        marginBottom: '1rem',
        background: current.background,
        color: current.color,
        border: current.border,
        backdropFilter: 'blur(8px)',
        ...style,
      }}
    >
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{current.icon}</span>
      <div style={{ flex: 1 }}>{message || children}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'currentColor',
            opacity: 0.7,
            cursor: 'pointer',
            fontSize: '1rem',
            padding: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
