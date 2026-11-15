import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Target,
  Repeat,
  User,
  Compass,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Briefcase, label: 'Internships', to: '/internships' },
  { icon: GraduationCap, label: 'Placement Prep', to: '/placement' },
  { icon: Target, label: 'Skill Gap', to: '/skill-gap' },
  { icon: Repeat, label: 'Skill Exchange', to: '/skill-exchange' },
  { icon: User, label: 'Profile', to: '/profile' },
];

const Sidebar = () => {
  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        background: 'linear-gradient(180deg, #07070a 0%, #030304 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 30,
        color: '#f4f4f5',
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '1.5rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#ef233c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
            boxShadow: '0 0 16px rgba(239, 35, 60, 0.6)',
            transform: 'rotate(45deg)',
            flexShrink: 0,
          }}
        >
          <div style={{ transform: 'rotate(-45deg)' }}>
            <Compass size={18} color="#000000" />
          </div>
        </div>
        <div>
          <span
            className="font-manrope"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Career<span style={{ color: '#ef233c' }}>Bridge</span>
          </span>
          <div
            style={{
              fontSize: '0.65rem',
              color: '#71717a',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Red Noir Edition
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          padding: '1.25rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : '#a1a1aa',
                background: isActive
                  ? 'linear-gradient(135deg, #ef233c 0%, #b81428 100%)'
                  : 'transparent',
                boxShadow: isActive ? '0 4px 16px rgba(239, 35, 60, 0.4)' : 'none',
                textDecoration: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} color={isActive ? '#FFFFFF' : '#71717a'} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Explore Banner */}
      <div
        style={{
          margin: '1rem',
          padding: '1rem',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#ef233c',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <Sparkles size={14} /> Multidisciplinary
        </div>
        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', lineHeight: 1.4 }}>
          From CS & AI to Mechanical, Civil & Design. All branches unified.
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '0.72rem', color: '#52525b', fontWeight: 500 }}>
          CareerBridge v2.0 • Red Noir
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
