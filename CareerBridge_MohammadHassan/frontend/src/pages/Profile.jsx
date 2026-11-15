import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

const styles = {
  page: {
    maxWidth: '920px',
    margin: '0 auto',
    animation: 'fadeIn 0.3s ease',
    color: '#f4f4f5',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.75rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#FFFFFF',
    fontFamily: "'Manrope', sans-serif",
    letterSpacing: '-0.02em',
  },
  editBtn: {
    padding: '0.65rem 1.5rem',
    fontSize: '0.88rem',
    fontWeight: 700,
    borderRadius: '10px',
    cursor: 'pointer',
    background: '#ef233c',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 0 18px rgba(239, 35, 60, 0.45)',
    transition: 'all 0.2s',
  },
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '1.75rem',
    paddingBottom: '1.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  avatar: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ef233c, #b81428)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1.7rem',
    fontWeight: 800,
    flexShrink: 0,
    boxShadow: '0 0 25px rgba(239, 35, 60, 0.5)',
  },
  avatarName: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#FFFFFF',
    fontFamily: "'Manrope', sans-serif",
    marginBottom: '0.2rem',
  },
  avatarEmail: {
    fontSize: '0.88rem',
    color: '#a1a1aa',
    marginBottom: '0.5rem',
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    background: 'rgba(239, 35, 60, 0.15)',
    border: '1px solid rgba(239, 35, 60, 0.35)',
    color: '#fca5a5',
    letterSpacing: '0.06em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  fieldGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#a1a1aa',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  value: {
    fontSize: '0.95rem',
    color: '#f4f4f5',
    fontWeight: 500,
    padding: '0.55rem 0',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.92rem',
    border: '1.5px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    background: 'rgba(24, 24, 27, 0.8)',
    color: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.92rem',
    border: '1.5px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    background: 'rgba(24, 24, 27, 0.8)',
    color: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '90px',
    transition: 'all 0.2s',
  },
  skillsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.35rem',
  },
  skillTag: {
    padding: '0.35rem 0.85rem',
    background: 'rgba(239, 35, 60, 0.12)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 35, 60, 0.3)',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    gap: '0.85rem',
    marginTop: '2rem',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    padding: '0.75rem 2rem',
    fontSize: '0.92rem',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(135deg, #ef233c 0%, #b81428 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(239, 35, 60, 0.45)',
    transition: 'all 0.2s',
  },
  cancelBtn: {
    padding: '0.75rem 2rem',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: '#a1a1aa',
    background: 'rgba(24, 24, 27, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  msgSuccess: {
    background: 'rgba(16, 185, 129, 0.12)',
    color: '#6ee7b7',
    padding: '0.85rem 1.15rem',
    borderRadius: '10px',
    fontSize: '0.88rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  msgError: {
    background: 'rgba(239, 35, 60, 0.12)',
    color: '#fca5a5',
    padding: '0.85rem 1.15rem',
    borderRadius: '10px',
    fontSize: '0.88rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(239, 35, 60, 0.3)',
  },
};

const emptyProfile = {
  name: '',
  phone: '',
  college: '',
  department: '',
  year: '',
  bio: '',
  skills: '',
  linkedin: '',
  github: '',
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authAPI.getProfile();
        const payload = res.data?.data || res.data || {};
        const profile = payload.user || payload;
        const fields = {
          name: profile.name || user?.name || '',
          phone: profile.phone || '',
          college: profile.college || '',
          department: profile.department || '',
          year: profile.year || '',
          bio: profile.bio || '',
          skills: Array.isArray(profile.skills)
            ? profile.skills.join(', ')
            : profile.skills || '',
          linkedin: profile.linkedin || profile.linkedinUrl || '',
          github: profile.github || profile.githubUrl || '',
        };
        setForm(fields);
      } catch {
        // Prefill from auth context if backend offline
        setForm({
          ...emptyProfile,
          name: user?.name || '',
          college: user?.college || '',
          department: user?.department || '',
          year: user?.year || '',
          skills: user?.skills || '',
          bio: user?.bio || '',
          linkedin: user?.linkedin || '',
          github: user?.github || '',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        college: form.college,
        department: form.department,
        year: form.year,
        bio: form.bio,
        skills: form.skills,
        linkedin: form.linkedin,
        github: form.github,
      };
      const res = await authAPI.updateProfile(payload);
      const resData = res.data?.data || res.data || {};
      const updatedUser = resData.user || resData;
      updateUser({ ...user, ...updatedUser });
      setMessage({ type: 'success', text: 'Student profile updated successfully!' });
      setEditing(false);
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Failed to update profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
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

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  const skillList = form.skills
    ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Student Profile</h1>
        {!editing ? (
          <button style={styles.editBtn} onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        ) : null}
      </div>

      {message.text && (
        <div style={message.type === 'success' ? styles.msgSuccess : styles.msgError}>
          {message.text}
        </div>
      )}

      <Card>
        {/* Avatar and Basic Header */}
        <div style={styles.avatarRow}>
          <div style={styles.avatar}>{getInitials(form.name || user?.name)}</div>
          <div>
            <div style={styles.avatarName}>{form.name || user?.name || 'Student Name'}</div>
            <div style={styles.avatarEmail}>{user?.email || 'student@careerbridge.com'}</div>
            <span style={styles.roleBadge}>{user?.role || 'student'}</span>
          </div>
        </div>

        {/* Profile Fields */}
        <div style={styles.grid}>
          {/* Full Name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            {editing ? (
              <input
                style={styles.input}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Alex Johnson"
                onFocus={(e) => (e.target.style.borderColor = '#ef233c')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
            ) : (
              <div style={styles.value}>{form.name || 'Not provided'}</div>
            )}
          </div>

          {/* Phone */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone Number</label>
            {editing ? (
              <input
                style={styles.input}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                onFocus={(e) => (e.target.style.borderColor = '#ef233c')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
            ) : (
              <div style={styles.value}>{form.phone || 'Not provided'}</div>
            )}
          </div>

          {/* College */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>College / University</label>
            {editing ? (
              <input
                style={styles.input}
                name="college"
                value={form.college}
                onChange={handleChange}
                placeholder="e.g. Indian Institute of Technology"
                onFocus={(e) => (e.target.style.borderColor = '#ef233c')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
            ) : (
              <div style={styles.value}>{form.college || 'Not provided'}</div>
            )}
          </div>

          {/* Department */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Department / Major</label>
            {editing ? (
              <input
                style={styles.input}
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science and Engineering"
                onFocus={(e) => (e.target.style.borderColor = '#ef233c')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
            ) : (
              <div style={styles.value}>{form.department || 'Not provided'}</div>
            )}
          </div>

          {/* Academic Year */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Academic Year</label>
            {editing ? (
              <input
                style={styles.input}
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="e.g. 3rd Year"
                onFocus={(e) => (e.target.style.borderColor = '#ef233c')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
            ) : (
              <div style={styles.value}>{form.year || 'Not provided'}</div>
            )}
          </div>

          {/* LinkedIn Profile */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>LinkedIn Profile URL</label>
            {editing ? (
              <input
                style={styles.input}
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                onFocus={(e) => (e.target.style.borderColor = '#ef233c')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
            ) : (
              <div style={styles.value}>
                {form.linkedin ? (
                  <a
                    href={form.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ef233c', textDecoration: 'none' }}
                  >
                    {form.linkedin}
                  </a>
                ) : (
                  'Not provided'
                )}
              </div>
            )}
          </div>

          {/* GitHub Profile */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>GitHub Profile URL</label>
            {editing ? (
              <input
                style={styles.input}
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                onFocus={(e) => (e.target.style.borderColor = '#ef233c')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
            ) : (
              <div style={styles.value}>
                {form.github ? (
                  <a
                    href={form.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ef233c', textDecoration: 'none' }}
                  >
                    {form.github}
                  </a>
                ) : (
                  'Not provided'
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{ ...styles.fieldGroup, marginTop: '0.75rem' }}>
          <label style={styles.label}>About / Bio</label>
          {editing ? (
            <textarea
              style={styles.textarea}
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell recruiters and peers about your career goals, projects, and interests..."
              onFocus={(e) => (e.target.style.borderColor = '#ef233c')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
            />
          ) : (
            <div style={{ ...styles.value, lineHeight: 1.6 }}>
              {form.bio || 'No bio added yet.'}
            </div>
          )}
        </div>

        {/* Skills */}
        <div style={{ ...styles.fieldGroup, marginTop: '0.75rem' }}>
          <label style={styles.label}>Skills (comma separated)</label>
          {editing ? (
            <input
              style={styles.input}
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="e.g. React, JavaScript, Python, Flask, MySQL, Git"
              onFocus={(e) => (e.target.style.borderColor = '#ef233c')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
            />
          ) : skillList.length > 0 ? (
            <div style={styles.skillsWrap}>
              {skillList.map((skill, i) => (
                <span key={i} style={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div style={styles.value}>No skills listed yet.</div>
          )}
        </div>

        {/* Action Buttons in Edit Mode */}
        {editing && (
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => {
                setEditing(false);
                setMessage({ type: '', text: '' });
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              style={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;
