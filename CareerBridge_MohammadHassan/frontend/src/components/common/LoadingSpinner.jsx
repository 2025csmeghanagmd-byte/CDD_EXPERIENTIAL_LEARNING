import React from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    minHeight: '200px',
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTop: '3px solid #ef233c',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    boxShadow: '0 0 15px rgba(239, 35, 60, 0.3)',
  },
  text: {
    marginTop: '1.25rem',
    color: '#a1a1aa',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
};

const keyframes = `
@keyframes spin {
  0%   { transform: rotate(0deg);   }
  100% { transform: rotate(360deg); }
}`;

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <>
    <style>{keyframes}</style>
    <div style={styles.wrapper}>
      <div style={styles.spinner} />
      <p style={styles.text}>{message}</p>
    </div>
  </>
);

export default LoadingSpinner;
