import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Eye, EyeOff, Lock, Mail, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleQuickFill = (roleIdentifier, rolePassword) => {
    setForm({ identifier: roleIdentifier, password: rolePassword });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      setError('Please provide both email/username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(form.identifier, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Invalid email/username or password. Please try again.'
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
      {/* Background Ambience */}
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
          background: 'rgba(14, 14, 18, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2.75rem 2.5rem',
          width: '100%',
          maxWidth: '450px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 35, 60, 0.15)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo and Brand */}
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
              color: '#FFFFFF',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(239, 35, 60, 0.6)',
              transform: 'rotate(45deg)',
            }}
          >
            <div style={{ transform: 'rotate(-45deg)' }}>
              <Compass size={22} color="#000000" />
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
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#a1a1aa', margin: 0 }}>
            Sign in to your CareerBridge portal
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

        <form onSubmit={handleSubmit}>
          {/* Email or Username */}
          <div style={{ marginBottom: '1.25rem' }}>
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
              Email or Username
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
                <User size={18} />
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                placeholder="student@careerbridge.com or username"
                value={form.identifier}
                onChange={handleChange}
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
                  transition: 'all 0.2s',
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

          {/* Password */}
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.45rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#d4d4d8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.82rem',
                  color: '#ef233c',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Forgot Password?
              </Link>
            </div>
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
                <Lock size={18} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 2.8rem 0.8rem 2.6rem',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(24, 24, 27, 0.8)',
                  color: '#FFFFFF',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Quick test credentials */}
          <div
            style={{
              margin: '1.25rem 0',
              padding: '0.75rem 1rem',
              background: 'rgba(24, 24, 27, 0.6)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: '#a1a1aa',
                fontWeight: 600,
                marginBottom: '0.45rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={13} color="#ef233c" /> Quick Test Credentials:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('student@careerbridge.com', 'student123')}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  background: 'rgba(239, 35, 60, 0.12)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 35, 60, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Student (Email)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student', 'student123')}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  background: 'rgba(239, 35, 60, 0.18)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(239, 35, 60, 0.45)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Student (Username: student)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#d4d4d8',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Admin (admin)
              </button>
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
              boxShadow: '0 0 24px rgba(239, 35, 60, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            fontSize: '0.88rem',
            color: '#a1a1aa',
          }}
        >
          Don't have an account?
          <Link
            to="/register"
            style={{
              color: '#ef233c',
              fontWeight: 700,
              marginLeft: '0.4rem',
              textDecoration: 'none',
            }}
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
