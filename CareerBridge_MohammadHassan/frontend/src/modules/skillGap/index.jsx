import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { skillGapAPI } from '../../services/api';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

const SkillGapModule = () => {
  const [jobRoles, setJobRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Add skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newProficiency, setNewProficiency] = useState('intermediate');
  const [savingSkill, setSavingSkill] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const rolesRes = await skillGapAPI.getJobRoles();
      const roles = rolesRes.data?.data?.job_roles || rolesRes.data?.job_roles || [];
      setJobRoles(roles);
      if (roles.length > 0) {
        setSelectedRole(roles[0]);
        triggerAnalysis(roles[0].id);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }

    try {
      const skillsRes = await skillGapAPI.getUserSkills();
      const skills = skillsRes.data?.data?.user_skills || skillsRes.data?.user_skills || [];
      setUserSkills(skills);
    } catch (err) {
      // Guest mode: empty user skills is normal
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSavingSkill(true);
    try {
      await skillGapAPI.addUserSkill({
        skill_name: newSkillName.trim(),
        proficiency: newProficiency,
      });
      setNewSkillName('');
      // refresh user skills
      const res = await skillGapAPI.getUserSkills();
      setUserSkills(res.data?.data?.user_skills || res.data?.user_skills || []);
      // if an analysis was already run, re-run
      if (selectedRole) {
        triggerAnalysis(selectedRole.id);
      }
    } catch (err) {
      alert(err.response?.status === 401 ? 'Please sign in to save your personal skill inventory.' : 'Failed to add skill');
    } finally {
      setSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await skillGapAPI.deleteUserSkill(id);
      setUserSkills((prev) => prev.filter((s) => s.id !== id));
      if (selectedRole) {
        triggerAnalysis(selectedRole.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerAnalysis = async (roleId) => {
    setAnalyzing(true);
    try {
      const res = await skillGapAPI.analyzeGap(roleId);
      setAnalysis(res.data?.data || res.data);
    } catch (err) {
      alert('Error analyzing skill gap.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    triggerAnalysis(role.id);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Module Title */}
      <div style={{ marginBottom: '2rem' }}>
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
            <Target size={14} color="#ef233c" /> Member 4 Module
          </span>
        </div>
        <h1 className="font-manrope" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
          Multidisciplinary Skill Gap Analyzer
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#a1a1aa', margin: '0.35rem 0 0 0' }}>
          Assess your preparedness against target industry roles, uncover missing competencies, and receive curated learning roadmaps.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* LEFT COLUMN: Role Selector & My Skill Inventory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Target Role Selector */}
          <div style={{
            background: 'rgba(14, 14, 18, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <h3 className="font-manrope" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
              1. Choose Target Career Role
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#a1a1aa', margin: '0 0 1rem 0' }}>
              Select a specialization across Software, Mechanical, VLSI, Design, or Finance:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
              {jobRoles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? '#ef233c' : 'rgba(255, 255, 255, 0.08)'}`,
                      background: isSelected ? 'rgba(239, 35, 60, 0.14)' : 'rgba(24, 24, 27, 0.6)',
                      boxShadow: isSelected ? '0 0 16px rgba(239, 35, 60, 0.25)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#d4d4d8' }}>
                        {role.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '0.15rem' }}>
                        {role.skills_list?.length || 0} core competencies
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} color="#ef233c" />}
                  </div>
                );
              })}
            </div>

            {selectedRole && (
              <button
                onClick={() => triggerAnalysis(selectedRole.id)}
                disabled={analyzing}
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef233c, #b81428)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
                }}
              >
                <Sparkles size={16} />
                <span>{analyzing ? 'Analyzing Match...' : 'Run Gap Analysis'}</span>
              </button>
            )}
          </div>

          {/* Student's Registered Skills Inventory */}
          <div style={{
            background: 'rgba(14, 14, 18, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <h3 className="font-manrope" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
              2. My Skills Inventory
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#a1a1aa', margin: '0 0 1rem 0' }}>
              Add your current competencies to match against industry standards:
            </p>

            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="e.g. React, CAD, Python..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(24, 24, 27, 0.8)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <select
                value={newProficiency}
                onChange={(e) => setNewProficiency(e.target.value)}
                style={{
                  padding: '0.65rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  backgroundColor: 'rgba(24, 24, 27, 0.8)',
                  color: '#FFFFFF',
                }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                type="submit"
                disabled={savingSkill}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ef233c, #b81428)',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: savingSkill ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 0 12px rgba(239, 35, 60, 0.4)',
                }}
              >
                <Plus size={16} />
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {userSkills.map((sk) => (
                <div
                  key={sk.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    background: 'rgba(239, 35, 60, 0.12)',
                    border: '1px solid rgba(239, 35, 60, 0.25)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#fca5a5',
                  }}
                >
                  <span>{sk.skill_name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 500 }}>
                    ({sk.proficiency})
                  </span>
                  <button
                    onClick={() => handleDeleteSkill(sk.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef233c',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Match Meter & Recommendations */}
        <div>
          {analysis ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Score Meter Card */}
              <div style={{
                background: 'rgba(14, 14, 18, 0.75)',
                backdropFilter: 'blur(12px)',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef233c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Employability Readiness
                    </span>
                    <h2 className="font-manrope" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0 0 0' }}>
                      {analysis.job_role?.title}
                    </h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '2.6rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      color: analysis.readiness_score >= 70 ? '#34D399' : analysis.readiness_score >= 40 ? '#fde047' : '#ef233c',
                      textShadow: analysis.readiness_score < 40 ? '0 0 16px rgba(239, 35, 60, 0.5)' : 'none',
                    }}>
                      {analysis.readiness_score}%
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa' }}>Role Match</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  height: '10px',
                  borderRadius: '5px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${analysis.readiness_score}%`,
                    background:
                      analysis.readiness_score >= 70
                        ? 'linear-gradient(90deg, #10B981, #059669)'
                        : analysis.readiness_score >= 40
                        ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                        : 'linear-gradient(90deg, #ef233c, #b81428)',
                    boxShadow: analysis.readiness_score < 40 ? '0 0 12px rgba(239, 35, 60, 0.6)' : 'none',
                    borderRadius: '5px',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>

                {/* Acquired vs Missing Matrix */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Matching */}
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34D399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <CheckCircle2 size={16} /> Skills Acquired ({analysis.matching_skills?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {analysis.matching_skills?.map((s, idx) => (
                        <span key={idx} style={{
                          fontSize: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#6ee7b7',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}>
                          {s}
                        </span>
                      ))}
                      {analysis.matching_skills?.length === 0 && (
                        <span style={{ fontSize: '0.78rem', color: '#6ee7b7' }}>None acquired yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing */}
                  <div style={{
                    background: 'rgba(239, 35, 60, 0.12)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid rgba(239, 35, 60, 0.3)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <AlertCircle size={16} color="#ef233c" /> Missing Skills ({analysis.missing_skills?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {analysis.missing_skills?.map((s, idx) => (
                        <span key={idx} style={{
                          fontSize: '0.75rem',
                          background: 'rgba(239, 35, 60, 0.2)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 35, 60, 0.4)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Curated Roadmap */}
              <div style={{
                background: 'rgba(14, 14, 18, 0.75)',
                backdropFilter: 'blur(12px)',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}>
                <h3 className="font-manrope" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
                  Personalized Learning Recommendations
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: '0 0 1.25rem 0' }}>
                  Targeted courses, interactive documentation and guides to close your missing skill gaps:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {(analysis.recommendations || []).map((rec, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        background: 'rgba(24, 24, 27, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#fca5a5',
                          background: 'rgba(239, 35, 60, 0.15)',
                          border: '1px solid rgba(239, 35, 60, 0.3)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          marginBottom: '0.25rem',
                          letterSpacing: '0.04em',
                        }}>
                          {rec.skill_name}
                        </span>
                        <div className="font-manrope" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {rec.resource_title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
                          Platform: {rec.platform} • {rec.resource_type}
                        </div>
                      </div>

                      <a
                        href={rec.resource_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.55rem 1rem',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #ef233c, #b81428)',
                          color: '#FFFFFF',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          flexShrink: 0,
                          boxShadow: '0 0 14px rgba(239, 35, 60, 0.4)',
                        }}
                      >
                        <span>Learn</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(14, 14, 18, 0.75)',
              backdropFilter: 'blur(12px)',
              borderRadius: '20px',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <Target size={44} color="#ef233c" style={{ marginBottom: '1rem' }} />
              <h3 className="font-manrope" style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
                Select a Career Role to View Gap Analysis
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.88rem', margin: 0 }}>
                Choose any engineering, tech, or business discipline on the left and hit "Run Gap Analysis".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SkillGapRoutes = () => (
  <Routes>
    <Route index element={<SkillGapModule />} />
  </Routes>
);

export default SkillGapRoutes;
