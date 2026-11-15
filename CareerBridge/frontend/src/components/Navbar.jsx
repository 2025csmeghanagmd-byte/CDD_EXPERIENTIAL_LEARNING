import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <nav
      style={{
        height: '68px',
        background: 'rgba(10, 10, 14, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        color: '#f4f4f5',
      }}
    >
      {/* Left campus & branch info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#e4e4e7',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          <span style={{ color: '#ef233c' }}>🎓</span> {user?.college || 'Connected Campus'}
        </span>
        {user?.department && (
          <span
            style={{
              fontSize: '0.8rem',
              color: '#a1a1aa',
              fontWeight: 500,
            }}
          >
            • {user.department}
          </span>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {user ? (
          <>
            <div
              style={{
                fontSize: '0.88rem',
                color: '#a1a1aa',
                fontWeight: 500,
              }}
            >
              Welcome, <strong style={{ color: '#ffffff' }}>{user.name}</strong>
            </div>

            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef233c, #b81428)',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 0 14px rgba(239, 35, 60, 0.45)',
                transition: 'transform 0.15s ease',
              }}
              title="Manage Student Profile"
            >
              {getInitials(user.name)}
            </Link>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.95rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#fca5a5',
                background: 'rgba(239, 35, 60, 0.12)',
                border: '1px solid rgba(239, 35, 60, 0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 35, 60, 0.22)';
                e.currentTarget.style.borderColor = 'rgba(239, 35, 60, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 35, 60, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(239, 35, 60, 0.3)';
              }}
              title="Sign out of CareerBridge"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#e4e4e7',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1.1rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #ef233c, #b81428)',
                border: 'none',
                borderRadius: '10px',
                textDecoration: 'none',
                boxShadow: '0 0 14px rgba(239, 35, 60, 0.4)',
              }}
            >
              <UserPlus size={14} />
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
