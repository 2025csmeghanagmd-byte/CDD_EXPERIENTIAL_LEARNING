import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  Briefcase,
  GraduationCap,
  Target,
  Repeat,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Zap,
} from 'lucide-react';

const quickActions = [
  {
    icon: Briefcase,
    label: 'Browse Internships',
    to: '/internships',
    color: '#ef233c',
    bg: 'rgba(239, 35, 60, 0.12)',
    desc: 'Explore curated engineering, tech, and business roles with 1-click apply',
  },
  {
    icon: GraduationCap,
    label: 'Placement Prep & Tests',
    to: '/placement',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    desc: 'Practice aptitude, core domain MCQs, and timed interactive mock exams',
  },
  {
    icon: Target,
    label: 'Analyze Skill Gap',
    to: '/skill-gap',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.12)',
    desc: 'Benchmark competencies against target dream roles & get roadmaps',
  },
  {
    icon: Repeat,
    label: 'Campus Skill Exchange',
    to: '/skill-exchange',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    desc: 'Teach what you excel at and learn new skills from peers 1-on-1',
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInternships: 10,
    applications: 2,
    skills: 5,
    exchangeActivities: 2,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authAPI.getDashboardStats();
        const data = res.data?.data || res.data || {};
        setStats({
          totalInternships: data.totalInternships ?? data.total_internships ?? 10,
          applications: data.applications ?? data.my_applications ?? 0,
          skills: data.skills ?? data.my_skills_count ?? 0,
          exchangeActivities: data.exchangeActivities ?? data.exchange_activities ?? 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      key: 'totalInternships',
      label: 'Open Internships',
      icon: Briefcase,
      color: '#ef233c',
      bg: 'rgba(239, 35, 60, 0.12)',
      value: stats.totalInternships,
      link: '/internships',
    },
    {
      key: 'applications',
      label: 'My Applications',
      icon: TrendingUp,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
      value: stats.applications,
      link: '/internships',
    },
    {
      key: 'skills',
      label: 'Acquired Skills',
      icon: Target,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      value: stats.skills,
      link: '/skill-gap',
    },
    {
      key: 'exchangeActivities',
      label: 'Peer Exchanges',
      icon: Repeat,
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.12)',
      value: stats.exchangeActivities,
      link: '/skill-exchange',
    },
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Hero Welcome Banner - Red Noir */}
      <div
        style={{
          background: 'linear-gradient(135deg, #180406 0%, #0d0d12 60%, #150305 100%)',
          borderRadius: '24px',
          padding: '2.5rem',
          color: '#FFFFFF',
          marginBottom: '2rem',
          border: '1px solid rgba(239, 35, 60, 0.25)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 35, 60, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              background: 'rgba(239, 35, 60, 0.15)',
              border: '1px solid rgba(239, 35, 60, 0.3)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#fca5a5',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.9rem',
            }}
          >
            <Sparkles size={14} color="#ef233c" /> Student Employability Console
          </div>
          <h1
            className="font-manrope"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              fontWeight: 800,
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            {user ? `Welcome back, ${user.name}!` : 'Welcome to CareerBridge!'}
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>
            {user?.department ? `${user.department} • ` : 'All multidisciplinary engineering, tech & business tracks • '}
            {user?.college || 'Connected Campus'}
            <br />
            Explore vetted internships, test placement problem-solving, and exchange skills across disciplines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <Link
            to="/profile"
            className="noir-btn-secondary"
            style={{
              padding: '0.75rem 1.4rem',
              fontSize: '0.88rem',
            }}
          >
            Edit Profile
          </Link>
          <Link
            to="/placement"
            className="shiny-cta"
            style={{
              padding: '0.75rem 1.6rem',
              fontSize: '0.88rem',
            }}
          >
            <span>Take Mock Test</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {statCards.map((sc) => {
          const Icon = sc.icon;
          return (
            <Link
              key={sc.key}
              to={sc.link}
              style={{
                background: 'rgba(14, 14, 18, 0.75)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                textDecoration: 'none',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(239, 35, 60, 0.35)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(239, 35, 60, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: sc.bg,
                  color: sc.color,
                  border: `1px solid ${sc.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={24} />
              </div>
              <div>
                <div
                  className="font-manrope"
                  style={{
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    lineHeight: 1,
                  }}
                >
                  {loading ? '...' : sc.value}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    color: '#a1a1aa',
                    fontWeight: 600,
                    marginTop: '0.35rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {sc.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Access Modules - Bento Style */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2
          className="font-manrope"
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          Explore Platform Modules
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {quickActions.map((qa, idx) => {
            const Icon = qa.icon;
            return (
              <Link
                key={idx}
                to={qa.to}
                style={{
                  background: 'rgba(14, 14, 18, 0.75)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  padding: '1.75rem 1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(239, 35, 60, 0.35)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(239, 35, 60, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: qa.bg,
                      color: qa.color,
                      border: `1px solid ${qa.color}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3
                    className="font-manrope"
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      margin: '0 0 0.5rem 0',
                    }}
                  >
                    {qa.label}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#a1a1aa', lineHeight: 1.55, margin: 0 }}>
                    {qa.desc}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: qa.color,
                    marginTop: '1.5rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                  }}
                >
                  <span>OPEN MODULE</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Multidisciplinary Quick Highlights */}
      <div
        style={{
          background: 'rgba(14, 14, 18, 0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '1.75rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={18} color="#ef233c" />
          <h3
            className="font-manrope"
            style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}
          >
            Multidisciplinary Career Pathways Active
          </h3>
        </div>
        <p style={{ fontSize: '0.88rem', color: '#a1a1aa', margin: '0 0 1rem 0' }}>
          CareerBridge maps competencies across Mechanical (CAD/FEA), Electronics (RTOS/VLSI), Software (React/Python), Design (Figma), and Analytics.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            'Software & Full-Stack',
            'Data Science & ML',
            'Mechanical Design & CAD',
            'Embedded Systems & IoT',
            'Civil & Structural',
            'UI/UX Product Design',
            'Financial Modeling',
          ].map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#d4d4d8',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
