import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TubesBackground from '../components/common/TubesBackground';
import {
  Compass,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Target,
  Repeat,
  Sparkles,
  Building,
  Star,
  Cpu,
  Wrench,
  Palette,
  BarChart2,
  ChevronRight,
  Zap,
  Code,
  Layers,
  Bot,
  User,
  Check,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const supportedDomains = [
  { name: 'Software Engineering & IT', icon: Cpu, count: '140+ Roles' },
  { name: 'AI & Machine Learning', icon: Bot, count: '85+ Roles' },
  { name: 'Mechanical & CAD', icon: Wrench, count: '65+ Roles' },
  { name: 'Electronics & VLSI', icon: Zap, count: '50+ Roles' },
  { name: 'Civil & Infrastructure', icon: Building, count: '45+ Roles' },
  { name: 'UI/UX & Product Design', icon: Palette, count: '60+ Roles' },
  { name: 'Finance & Analytics', icon: BarChart2, count: '55+ Roles' },
  { name: 'Robotics & Automation', icon: Layers, count: '40+ Roles' },
];

const bentoModules = [
  {
    id: 'internship',
    title: 'Internship Tracker & Portal',
    badge: 'MODULE 01 • REAL-TIME',
    desc: 'Explore vetted openings across multiple disciplines with real-time status tracking, 1-click apply, application history, and deadline notifications.',
    icon: Briefcase,
    link: '/internships',
    accentColor: '#ef233c',
    highlightTags: ['Real-Time Status', '1-Click Apply', 'Multi-Discipline', 'Bookmarking'],
    isLarge: true,
  },
  {
    id: 'placement',
    title: 'Placement Prep & Tests',
    badge: 'MODULE 02 • ASSESSMENT',
    desc: 'Timed mock assessments, quantitative aptitude, algorithmic DSA question banks, and company-specific technical tracks.',
    icon: GraduationCap,
    link: '/placement',
    accentColor: '#3b82f6',
    highlightTags: ['DSA Tracks', 'Aptitude Tests', 'Instant Scoring'],
    isLarge: false,
  },
  {
    id: 'skill-gap',
    title: 'Skill Gap Analyzer',
    badge: 'MODULE 03 • DIAGNOSTICS',
    desc: 'Select your target dream role to benchmark current competencies, uncover missing prerequisites, and receive curated pathways.',
    icon: Target,
    link: '/skill-gap',
    accentColor: '#eab308',
    highlightTags: ['Readiness Score', 'Prerequisite Map', 'Curated Resources'],
    isLarge: false,
  },
  {
    id: 'skill-exchange',
    title: 'Peer Skill Exchange',
    badge: 'MODULE 04 • COLLABORATION',
    desc: 'Connect with talented campus peers across faculties to exchange skills, offer 1-on-1 peer sessions, and collaborate on multidisciplinary projects.',
    icon: Repeat,
    link: '/skill-exchange',
    accentColor: '#a855f7',
    highlightTags: ['Cross-Branch Matching', '1-on-1 Tutoring', 'Campus Collaboration'],
    isLarge: false,
  },
];

const ecosystemLogos = [
  'Python Flask',
  'React 18',
  'MySQL Enterprise',
  'Docker Containers',
  'OpenAI GPT-4',
  'AWS Cloud',
  'GitHub CI/CD',
  'Figma Design',
  'Linux Kernel',
  'MATLAB & Simulink',
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="selection-red font-inter text-zinc-100 bg-black min-h-screen relative overflow-x-hidden">
      {/* ── GLOBAL NOIR BACKGROUND & STARFIELD ─────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Obsidian to pitch black gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, #160405 0%, #08080a 40%, #030304 100%)',
          }}
        />
        {/* Parallax Stars */}
        <div className="absolute top-0 left-0 stars-1" />
        <div className="absolute top-0 left-0 stars-2" />
        {/* Central Red Ambient Nebula Glow */}
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '900px',
            height: '900px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 35, 60, 0.08) 0%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
        {/* Subtle Geometric Noir Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          }}
        />
      </div>

      {/* ── TOP BLUR GRADIENT OVERLAY ──────────────────────────── */}
      <div className="gradient-blur" />

      {/* ── FLOATING GLASS PILL NAVBAR ──────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 50,
          padding: '1.25rem 1rem 0',
        }}
      >
        <nav
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(5, 5, 5, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            padding: '0.75rem 1.75rem',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Brand Mark */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: '#FFFFFF',
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                backgroundColor: '#ef233c',
                borderRadius: '3px',
                transform: 'rotate(45deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(239, 35, 60, 0.7)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#000000',
                  borderRadius: '1px',
                }}
              />
            </div>
            <span
              className="font-manrope"
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}
            >
              Career<span style={{ color: '#ef233c' }}>Bridge</span>
            </span>
          </Link>

          {/* Quick Navigation Links */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2rem',
            }}
            className="md-nav-links"
          >
            <a
              href="#modules"
              style={{
                fontSize: '0.875rem',
                color: '#a1a1aa',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
            >
              Platform Modules
            </a>
            <a
              href="#domains"
              style={{
                fontSize: '0.875rem',
                color: '#a1a1aa',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
            >
              Disciplines
            </a>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <Link
                to="/dashboard"
                className="shiny-cta"
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
              >
                <span>Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    color: '#d4d4d8',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    padding: '0.4rem 0.8rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#d4d4d8')}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="shiny-cta"
                  style={{
                    padding: '0.55rem 1.35rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>Get Access</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── MAIN CONTENT WRAPPER ────────────────────────────────── */}
      <main style={{ position: 'relative', zIndex: 10 }}>
        {/* ── HERO SECTION WITH 3D WEBGL TUBES (RED NOIR) ─────── */}
        <section style={{ paddingTop: '8rem', position: 'relative' }}>
          <TubesBackground
            className="red-noir-hero"
            enableClickInteraction={true}
            showHint={true}
          >
            <div
              style={{
                minHeight: '75vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '3rem 1.5rem 6rem',
                maxWidth: '1000px',
                margin: '0 auto',
              }}
            >
              {/* Pulsing Live Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.45rem 1.2rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '2rem',
                  pointerEvents: 'auto',
                }}
              >
                <span
                  style={{
                    position: 'relative',
                    display: 'flex',
                    width: '8px',
                    height: '8px',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      display: 'inline-flex',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: '#ef233c',
                      opacity: 0.75,
                      animation: 'pulseGlow 2s infinite',
                    }}
                  />
                  <span
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ef233c',
                    }}
                  />
                </span>
                <span
                  className="font-manrope"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#fecdd3',
                    letterSpacing: '0.04em',
                  }}
                >
                  CareerBridge 2.0 • Design Intelligence & Employability OS
                </span>
                <ChevronRight size={14} color="#ef233c" />
              </div>

              {/* Red Noir Typography Headline */}
              <h1
                className="font-manrope"
                style={{
                  fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.08,
                  marginBottom: '1.75rem',
                  userSelect: 'none',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 60%, rgba(255,255,255,0.4) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Career Intelligence
                </span>
                <span
                  style={{
                    display: 'block',
                    background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 60%, rgba(255,255,255,0.4) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  for the{' '}
                  <span
                    style={{
                      color: '#ef233c',
                      position: 'relative',
                      display: 'inline-block',
                      WebkitTextFillColor: '#ef233c',
                    }}
                  >
                    Future
                    <svg
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '12px',
                        bottom: '-6px',
                        left: 0,
                        color: '#ef233c',
                        opacity: 0.7,
                      }}
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 5 Q 50 10 100 5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </svg>
                  </span>
                </span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                  lineHeight: 1.6,
                  color: '#a1a1aa',
                  maxWidth: '720px',
                  margin: '0 auto 2.5rem',
                  fontWeight: 400,
                  userSelect: 'none',
                }}
              >
                CareerBridge blends multidisciplinary skill gap diagnostics, vetted internship pipelines, timed mock tests, and campus peer knowledge exchange into one cohesive platform.
              </p>

              {/* Hero Call to Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  pointerEvents: 'auto',
                }}
              >
                <Link
                  to={user ? '/dashboard' : '/register'}
                  className="shiny-cta"
                  style={{
                    fontSize: '1rem',
                    padding: '1rem 2.5rem',
                  }}
                >
                  <span>Start Preparing Free</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to={user ? '/internships' : '/login'}
                  className="noir-btn-secondary"
                  style={{
                    fontSize: '1rem',
                    padding: '1rem 2.2rem',
                  }}
                >
                  <Briefcase size={17} color="#ef233c" />
                  <span>Explore Opportunities</span>
                </Link>
              </div>
            </div>
          </TubesBackground>
        </section>

        {/* ── INTEGRATED ECOSYSTEM LOGO STRIP ─────────────────────── */}
        <section
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(255, 255, 255, 0.015)',
            backdropFilter: 'blur(8px)',
            padding: '2.5rem 1.5rem',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: '#71717a',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                Standardized Tech & Tools:
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {ecosystemLogos.map((tech, idx) => (
                  <div
                    key={idx}
                    className="font-manrope"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#d4d4d8',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    <div
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#ef233c',
                        boxShadow: '0 0 6px #ef233c',
                      }}
                    />
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID: THE 4 PLATFORM MODULES ─────────────────── */}
        <section
          id="modules"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '7rem 1.5rem 6rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 4rem' }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#ef233c',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '0.75rem',
              }}
            >
              Unified Architecture
            </div>
            <h2
              className="font-manrope"
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: '#FFFFFF',
                marginBottom: '1.25rem',
              }}
            >
              The Operating System for <br />
              <span style={{ color: '#ef233c' }}>Multidisciplinary Careers</span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#a1a1aa', lineHeight: 1.6 }}>
              Replace fragmented job portals, disorganized test sheets, and isolated notes with one cohesive, modular ecosystem.
            </p>
          </div>

          {/* Bento Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {bentoModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    padding: '2.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'linear-gradient(180deg, rgba(24, 24, 27, 0.45) 0%, rgba(9, 9, 11, 0.85) 100%)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '340px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 35, 60, 0.35)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(239, 35, 60, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Top Row: Icon and Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: mod.accentColor,
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <span
                        className="font-manrope"
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          color: '#a1a1aa',
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        {mod.badge}
                      </span>
                    </div>

                    <h3
                      className="font-manrope"
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        letterSpacing: '-0.02em',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {mod.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.92rem',
                        color: '#a1a1aa',
                        lineHeight: 1.6,
                        marginBottom: '1.5rem',
                      }}
                    >
                      {mod.desc}
                    </p>

                    {/* Highlight Tags */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                      }}
                    >
                      {mod.highlightTags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#d4d4d8',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <Link
                    to={user ? mod.link : '/login'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      color: mod.accentColor,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      fontFamily: 'monospace',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '1.25rem',
                      marginTop: '0.5rem',
                      transition: 'color 0.2s',
                    }}
                  >
                    <span>EXPLORE MODULE</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── MULTIDISCIPLINARY DOMAINS GRID ───────────────────────── */}
        <section
          id="domains"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '7rem 1.5rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#ef233c',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '0.5rem',
                display: 'inline-block',
              }}
            >
              Universal Domain Coverage
            </span>
            <h2
              className="font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                marginBottom: '1rem',
              }}
            >
              Built for Every Engineering & Business Branch
            </h2>
            <p style={{ fontSize: '1rem', color: '#a1a1aa' }}>
              Students can transition or benchmark across multidisciplinary tracks regardless of their original department.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {supportedDomains.map((dom, idx) => {
              const Icon = dom.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(18, 18, 22, 0.7)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 35, 60, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 35, 60, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(239, 35, 60, 0.1)',
                        color: '#ef233c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div
                        className="font-manrope"
                        style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}
                      >
                        {dom.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#71717a' }}>
                        {dom.count}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#71717a" />
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CALL TO ACTION BANNER ───────────────────────────────── */}
        <section
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '7rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'rgba(10, 10, 12, 0.4)',
          }}
        >
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <h2
              className="font-manrope"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.04em',
                marginBottom: '1.25rem',
              }}
            >
              Ready to <span style={{ color: '#ef233c' }}>Build Your Career?</span>
            </h2>
            <p
              style={{
                fontSize: '1.15rem',
                color: '#a1a1aa',
                marginBottom: '2.5rem',
                lineHeight: 1.6,
              }}
            >
              Join ambitious students across 18+ academic departments who are actively preparing, benchmarking, and landing opportunities.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to={user ? '/dashboard' : '/register'}
                className="shiny-cta"
                style={{
                  padding: '1rem 2.75rem',
                  fontSize: '1rem',
                }}
              >
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── GIANT WATERMARK FOOTER (RED NOIR) ───────────────────── */}
      <footer
        style={{
          backgroundColor: '#020203',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '5rem',
          paddingBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '0 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 2' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#ef233c',
                  borderRadius: '3px',
                  transform: 'rotate(45deg)',
                }}
              />
              <span
                className="font-manrope"
                style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}
              >
                CareerBridge
              </span>
            </div>
            <p
              style={{
                fontSize: '0.9rem',
                color: '#71717a',
                lineHeight: 1.65,
                maxWidth: '380px',
              }}
            >
              The premier multidisciplinary student career development and employability platform. Built with React, Flask, MySQL, and Docker.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#ef233c',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '1.25rem',
              }}
            >
              Platform Modules
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <li>
                <Link to="/internships" style={{ color: '#a1a1aa', textDecoration: 'none' }}>
                  Internships Portal
                </Link>
              </li>
              <li>
                <Link to="/placement" style={{ color: '#a1a1aa', textDecoration: 'none' }}>
                  Placement Preparation
                </Link>
              </li>
              <li>
                <Link to="/skill-gap" style={{ color: '#a1a1aa', textDecoration: 'none' }}>
                  Skill Gap Diagnostics
                </Link>
              </li>
              <li>
                <Link to="/skill-exchange" style={{ color: '#a1a1aa', textDecoration: 'none' }}>
                  Campus Skill Exchange
                </Link>
              </li>
            </ul>
          </div>

          {/* Team Roles Ownership */}
          <div>
            <h4
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#ef233c',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '1.25rem',
              }}
            >
              Team Architecture
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: '#71717a' }}>
              <li>Member 1: Core Platform & Auth</li>
              <li>Member 2: Internship Management</li>
              <li>Member 3: Placement Prep & Tests</li>
              <li>Member 4: Skill Gap Diagnostics</li>
              <li>Member 5: Campus Skill Exchange</li>
            </ul>
          </div>
        </div>

        {/* Huge Red Noir Text Stroke Watermark */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem 0',
            opacity: 0.12,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <h1
            className="font-manrope text-stroke"
            style={{
              fontSize: 'clamp(3rem, 13vw, 12rem)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              lineHeight: 0.9,
              textAlign: 'center',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            CAREERBRIDGE
          </h1>
        </div>

        {/* Subfooter */}
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '1.5rem 1.5rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#71717a',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} CareerBridge Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ color: '#52525b' }}>Engineered for Multidisciplinary Employability</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
