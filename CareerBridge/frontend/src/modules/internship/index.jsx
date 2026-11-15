import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { internshipAPI } from '../../services/api';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  CheckCircle,
  Calendar,
  Send,
  Building,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const InternshipModule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'applications' | 'bookmarks'
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');

  // Application Modal state
  const [applyingItem, setApplyingItem] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, [typeFilter, domainFilter]);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'bookmarks') {
      fetchBookmarks();
    }
  }, [activeTab]);

  const fetchInternships = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (domainFilter !== 'all') params.domain = domainFilter;

      const res = await internshipAPI.getAll(params);
      const list = res.data?.data?.internships || res.data?.internships || [];
      setInternships(list);
    } catch (err) {
      setError('Failed to load internships.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await internshipAPI.getMyApplications();
      const list = res.data?.data?.applications || res.data?.applications || [];
      setApplications(list);
    } catch (err) {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await internshipAPI.getBookmarks();
      const list = res.data?.data?.bookmarks || res.data?.bookmarks || [];
      setBookmarks(list);
    } catch (err) {
      setError('Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (id, e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in or register to bookmark internship opportunities.');
      navigate('/login');
      return;
    }
    try {
      await internshipAPI.bookmark(id);
      // update state locally
      setInternships((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_bookmarked: !item.is_bookmarked } : item
        )
      );
      if (activeTab === 'bookmarks') {
        fetchBookmarks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenApplyModal = (item) => {
    if (!user) {
      alert('Please sign in or register to submit an internship application.');
      navigate('/login');
      return;
    }
    setApplyingItem(item);
    setCoverLetter('');
    setResumeUrl('');
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyingItem) return;
    setSubmittingApp(true);
    try {
      await internshipAPI.apply({
        internship_id: applyingItem.id,
        cover_letter: coverLetter,
        resume_url: resumeUrl,
      });
      setFeedbackMsg(`Application submitted for ${applyingItem.title}!`);
      setApplyingItem(null);
      // Refresh list to show has_applied
      fetchInternships();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.75rem',
              background: 'rgba(239, 35, 60, 0.15)',
              border: '1px solid rgba(239, 35, 60, 0.3)',
              color: '#fca5a5',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              <Briefcase size={13} color="#ef233c" /> Member 2 Module
            </span>
          </div>
          <h1 className="font-manrope" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            Internship & Application Management
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#a1a1aa', margin: '0.35rem 0 0 0' }}>
            Discover multidisciplinary internship roles across Engineering, AI, Design, Finance & Core domains.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          background: 'rgba(24, 24, 27, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '4px',
          borderRadius: '12px',
          gap: '4px',
        }}>
          {[
            { id: 'browse', label: 'Explore Roles' },
            { id: 'applications', label: `My Applications (${applications.length || '•'})` },
            { id: 'bookmarks', label: 'Saved Bookmarks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#ef233c' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : '#a1a1aa',
                boxShadow: activeTab === tab.id ? '0 0 14px rgba(239, 35, 60, 0.45)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {feedbackMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.85rem 1.25rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          color: '#34D399',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}>
          <CheckCircle size={18} color="#34D399" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* TAB 1: BROWSE INTERNSHIPS */}
      {activeTab === 'browse' && (
        <div>
          {/* Search & Filter Bar */}
          <div style={{
            background: 'rgba(14, 14, 18, 0.75)',
            backdropFilter: 'blur(12px)',
            padding: '1.25rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
          }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 260px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#71717a',
              }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by title, company, or skills (e.g. React, CAD, Python)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInternships()}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Domain Filter */}
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.88rem',
                outline: 'none',
                fontWeight: 500,
              }}
            >
              <option value="all">All Domains & Fields</option>
              <option value="Frontend">Frontend & Web</option>
              <option value="Backend">Backend & APIs</option>
              <option value="Data Science">Data Science & AI</option>
              <option value="Mobile">Mobile App Dev</option>
              <option value="DevOps">Cloud & DevOps</option>
              <option value="CAD">Mechanical & CAD</option>
              <option value="Embedded">Electronics & Embedded</option>
              <option value="Design">UI/UX Design</option>
              <option value="Financial">Finance & Analytics</option>
              <option value="Civil">Civil & Structural</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.88rem',
                outline: 'none',
                fontWeight: 500,
              }}
            >
              <option value="all">All Modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-Site</option>
            </select>

            <button
              onClick={fetchInternships}
              style={{
                padding: '0.7rem 1.4rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef233c, #b81428)',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
              }}
            >
              <Filter size={16} /> Filter
            </button>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading multidisciplinary opportunities...</div>
            </div>
          ) : internships.length === 0 ? (
            <div style={{
              background: 'rgba(14, 14, 18, 0.75)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <Briefcase size={40} color="#ef233c" style={{ marginBottom: '1rem' }} />
              <h3 className="font-manrope" style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>No matching internships found</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>Try clearing filters or search terms.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}>
              {internships.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(14, 14, 18, 0.75)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'rgba(239, 35, 60, 0.35)';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(239, 35, 60, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
                  }}
                >
                  {/* Card Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(239, 35, 60, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef233c',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          border: '1px solid rgba(239, 35, 60, 0.25)',
                        }}>
                          {item.company ? item.company[0] : 'C'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a1a1aa' }}>
                            {item.company}
                          </div>
                          <h3 className="font-manrope" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: '0.15rem 0 0 0' }}>
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleToggleBookmark(item.id, e)}
                        style={{
                          background: item.is_bookmarked ? 'rgba(239, 35, 60, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${item.is_bookmarked ? 'rgba(239, 35, 60, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                          borderRadius: '8px',
                          padding: '6px',
                          cursor: 'pointer',
                          color: item.is_bookmarked ? '#ef233c' : '#71717a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={item.is_bookmarked ? 'Remove Bookmark' : 'Save for later'}
                      >
                        <Bookmark size={18} fill={item.is_bookmarked ? '#ef233c' : 'none'} />
                      </button>
                    </div>

                    {/* Metadata Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0.85rem 0' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#d4d4d8',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        fontWeight: 500,
                      }}>
                        <MapPin size={12} color="#ef233c" /> {item.location || 'Remote'}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        background: item.type === 'remote' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: item.type === 'remote' ? '#6ee7b7' : '#93c5fd',
                        border: `1px solid ${item.type === 'remote' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}>
                        {item.type || 'remote'}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        background: 'rgba(234, 179, 8, 0.15)',
                        color: '#fde047',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        fontWeight: 600,
                      }}>
                        ₹{item.stipend ? Number(item.stipend).toLocaleString('en-IN') : '15,000'}/mo
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#a1a1aa',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}>
                        <Clock size={12} /> {item.duration || '3 months'}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.86rem',
                      color: '#a1a1aa',
                      lineHeight: 1.5,
                      margin: '0.5rem 0 1rem 0',
                    }}>
                      {item.description}
                    </p>

                    {/* Required Skills */}
                    {item.skills_required && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                        {item.skills_required.split(',').map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              background: 'rgba(239, 35, 60, 0.1)',
                              color: '#fca5a5',
                              border: '1px solid rgba(239, 35, 60, 0.25)',
                              fontWeight: 500,
                            }}
                          >
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '0.76rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} /> Deadline: {item.deadline || 'Rolling'}
                    </span>

                    {item.has_applied ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#34D399',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                      }}>
                        <CheckCircle size={15} /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenApplyModal(item)}
                        style={{
                          padding: '0.55rem 1.25rem',
                          background: 'linear-gradient(135deg, #ef233c 0%, #b81428 100%)',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
                        }}
                      >
                        <span>Apply</span>
                        <Send size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS TRACKER */}
      {activeTab === 'applications' && (
        <div style={{
          background: 'rgba(14, 14, 18, 0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 className="font-manrope" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
              My Internship Application Status Board
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0 }}>
              Track interview rounds, screening progress, and application decisions in real time.
            </p>
          </div>

          {applications.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#a1a1aa' }}>
              <Briefcase size={38} color="#ef233c" style={{ marginBottom: '0.75rem' }} />
              <div className="font-manrope" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>No applications submitted yet</div>
              <p style={{ fontSize: '0.88rem', margin: '0.4rem 0 1.25rem 0', color: '#71717a' }}>
                Browse open multidisciplinary roles and submit your resume.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                style={{
                  padding: '0.65rem 1.4rem',
                  background: 'linear-gradient(135deg, #ef233c, #b81428)',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
                }}
              >
                Browse Internships
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(24, 24, 27, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company & Role</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode & Location</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stipend</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied Date</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.application_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem' }}>{app.title}</div>
                        <div style={{ fontSize: '0.82rem', color: '#a1a1aa' }}>{app.company}</div>
                      </td>
                      <td style={{ padding: '1.1rem 1.25rem', fontSize: '0.85rem', color: '#d4d4d8' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{app.type}</span> • {app.location || 'Remote'}
                      </td>
                      <td style={{ padding: '1.1rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>
                        ₹{app.stipend ? Number(app.stipend).toLocaleString('en-IN') : '15,000'}/mo
                      </td>
                      <td style={{ padding: '1.1rem 1.25rem', fontSize: '0.82rem', color: '#71717a' }}>
                        {app.applied_at ? String(app.applied_at).slice(0, 10) : 'Recent'}
                      </td>
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background:
                            app.status === 'accepted' ? 'rgba(16, 185, 129, 0.15)' :
                            app.status === 'rejected' ? 'rgba(239, 35, 60, 0.15)' :
                            'rgba(234, 179, 8, 0.15)',
                          color:
                            app.status === 'accepted' ? '#34D399' :
                            app.status === 'rejected' ? '#fca5a5' :
                            '#fde047',
                          border: `1px solid ${
                            app.status === 'accepted' ? 'rgba(16, 185, 129, 0.3)' :
                            app.status === 'rejected' ? 'rgba(239, 35, 60, 0.3)' :
                            'rgba(234, 179, 8, 0.3)'
                          }`,
                        }}>
                          {app.status || 'Under Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarks.length === 0 ? (
            <div style={{
              background: 'rgba(14, 14, 18, 0.75)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <Bookmark size={36} color="#ef233c" style={{ marginBottom: '0.75rem' }} />
              <h3 className="font-manrope" style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>No bookmarked internships yet</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                Click the bookmark icon on any internship card to save it for quick review.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}>
              {bookmarks.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(14, 14, 18, 0.75)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a1a1aa' }}>{item.company}</div>
                      <h3 className="font-manrope" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: '0.2rem 0' }}>{item.title}</h3>
                    </div>
                    <button
                      onClick={(e) => handleToggleBookmark(item.id, e)}
                      style={{
                        background: 'rgba(239, 35, 60, 0.15)',
                        border: '1px solid rgba(239, 35, 60, 0.3)',
                        borderRadius: '8px',
                        padding: '6px',
                        cursor: 'pointer',
                        color: '#ef233c',
                      }}
                    >
                      <Bookmark size={18} fill="#ef233c" />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#a1a1aa', margin: '0.75rem 0' }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fde047' }}>
                      ₹{item.stipend ? Number(item.stipend).toLocaleString('en-IN') : '15,000'}/mo
                    </span>
                    <button
                      onClick={() => handleOpenApplyModal(item)}
                      style={{
                        padding: '0.5rem 1.15rem',
                        background: 'linear-gradient(135deg, #ef233c, #b81428)',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 0 14px rgba(239, 35, 60, 0.4)',
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPLICATION MODAL */}
      {applyingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 3, 4, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div style={{
            background: 'rgba(14, 14, 18, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(239, 35, 60, 0.3)',
            width: '100%',
            maxWidth: '520px',
            padding: '2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 35px rgba(239, 35, 60, 0.18)',
            color: '#f4f4f5',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef233c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Submit Application
                </span>
                <h2 className="font-manrope" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0 0 0' }}>
                  {applyingItem.title}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>at {applyingItem.company}</div>
              </div>
              <button
                onClick={() => setApplyingItem(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: '#a1a1aa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApplication}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Resume URL / Portfolio Link
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... or LinkedIn/GitHub"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(24, 24, 27, 0.8)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Cover Letter / Note to Recruiter
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Introduce yourself, explain your relevant domain skills and why you're a strong fit for this internship..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(24, 24, 27, 0.8)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setApplyingItem(null)}
                  style={{
                    padding: '0.7rem 1.4rem',
                    borderRadius: '10px',
                    background: 'rgba(24, 24, 27, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#a1a1aa',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  style={{
                    padding: '0.7rem 1.6rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ef233c, #b81428)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    border: 'none',
                    cursor: submittingApp ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 18px rgba(239, 35, 60, 0.45)',
                  }}
                >
                  {submittingApp ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InternshipRoutes = () => (
  <Routes>
    <Route index element={<InternshipModule />} />
  </Routes>
);

export default InternshipRoutes;
