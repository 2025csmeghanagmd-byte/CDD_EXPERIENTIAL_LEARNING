import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { KeyRound, ArrowLeft, Mail, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.forgotPassword(email);
      const data = res.data?.data || res.data;
      setSuccessData(data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to process request. Please verify your email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="selection-red font-inter text-zinc-100"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #160405 0%, #08080a 50%, #030304 100%)',
        padding: '2.5rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 35, 60, 0.12) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(14, 14, 18, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 35, 60, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2.75rem 2.25rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#ef233c',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(239, 35, 60, 0.6)',
              transform: 'rotate(45deg)',
            }}
          >
            <div style={{ transform: 'rotate(-45deg)' }}>
              <KeyRound size={22} color="#000000" />
            </div>
          </div>
          <h1
            className="font-manrope"
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 0.4rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Recover Credentials
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#a1a1aa', margin: 0 }}>
            Enter your student email to generate a secure recovery token
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1rem',
              background: 'rgba(239, 35, 60, 0.12)',
              border: '1px solid rgba(239, 35, 60, 0.3)',
              borderRadius: '10px',
              color: '#fca5a5',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, color: '#ef233c' }} />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '10px',
                color: '#34D399',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Recovery Token Generated!</div>
                <div>Your reset token is ready below. Copy it or use the 1-click reset link.</div>
              </div>
            </div>

            {/* Token details card */}
            <div
              style={{
                background: 'rgba(24, 24, 27, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#a1a1aa',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Sparkles size={13} color="#ef233c" /> Simulated Reset Token:
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                  userSelect: 'all',
                  border: '1px dashed rgba(239, 35, 60, 0.3)',
                }}
              >
                {successData.reset_token || 'demo-reset-token-sample'}
              </div>
            </div>

            <Link
              to={`/reset-password?token=${encodeURIComponent(successData.reset_token || '')}`}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.9rem',
                borderRadius: '12px',
                background: '#ef233c',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: '0 0 25px rgba(239, 35, 60, 0.45)',
                marginBottom: '1rem',
                boxSizing: 'border-box',
              }}
            >
              Proceed to Reset Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#d4d4d8',
                  marginBottom: '0.45rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Student Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#71717a',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="student@careerbridge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.6rem',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(24, 24, 27, 0.8)',
                    color: '#FFFFFF',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ef233c';
                    e.target.style.boxShadow = '0 0 14px rgba(239, 35, 60, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '12px',
                backgroundColor: loading ? '#52525b' : '#ef233c',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 25px rgba(239, 35, 60, 0.45)',
                marginBottom: '1rem',
              }}
            >
              {loading ? 'Generating Recovery Token...' : 'Send Recovery Token'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#a1a1aa',
              fontSize: '0.88rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
