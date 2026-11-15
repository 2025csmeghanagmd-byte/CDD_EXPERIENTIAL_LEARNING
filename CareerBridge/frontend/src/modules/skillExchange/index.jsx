import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { skillExchangeAPI } from '../../services/api';
import {
  Repeat,
  Search,
  Plus,
  Send,
  User,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  DollarSign,
  MessageSquare,
  ArrowRightLeft
} from 'lucide-react';

const SkillExchangeModule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'requests'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'offer' | 'request'
  const [searchTerm, setSearchTerm] = useState('');
  const [listings, setListings] = useState([]);
  const [myRequests, setMyRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Modal: Create Listing
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListing, setNewListing] = useState({
    skill_name: '',
    description: '',
    type: 'offer',
  });
  const [creating, setCreating] = useState(false);

  // Modal: Send Exchange Request
  const [requestTargetListing, setRequestTargetListing] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  // Modal: Review
  const [reviewTargetUser, setReviewTargetUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [filterType]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchMyRequests();
    }
  }, [activeTab]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (searchTerm) params.search = searchTerm;
      const res = await skillExchangeAPI.getListings(params);
      setListings(res.data?.data?.listings || res.data?.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await skillExchangeAPI.getMyRequests();
      setMyRequests(res.data?.data || { sent: [], received: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!newListing.skill_name.trim()) return;
    setCreating(true);
    try {
      await skillExchangeAPI.createListing(newListing);
      setShowCreateModal(false);
      setNewListing({ skill_name: '', description: '', type: 'offer' });
      setFeedback('Your skill listing has been posted to campus!');
      fetchListings();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert('Failed to post skill listing.');
    } finally {
      setCreating(false);
    }
  };

  const handleSendExchangeRequest = async (e) => {
    e.preventDefault();
    if (!requestTargetListing) return;
    setSendingRequest(true);
    try {
      await skillExchangeAPI.sendRequest({
        listing_id: requestTargetListing.id,
        message: requestMessage,
      });
      setRequestTargetListing(null);
      setRequestMessage('');
      setFeedback(`Exchange request sent to ${requestTargetListing.user_name}!`);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await skillExchangeAPI.updateRequestStatus(requestId, status);
      fetchMyRequests();
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTargetUser) return;
    setSubmittingReview(true);
    try {
      await skillExchangeAPI.submitReview({
        reviewed_user_id: reviewTargetUser.id,
        rating: rating,
        comment: reviewComment,
      });
      setReviewTargetUser(null);
      setReviewComment('');
      setFeedback('Review submitted successfully!');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert('Error submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Title */}
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
              <Repeat size={14} color="#ef233c" /> Member 5 Module
            </span>
          </div>
          <h1 className="font-manrope" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            Campus Skill Exchange Marketplace
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#a1a1aa', margin: '0.35rem 0 0 0' }}>
            Teach what you excel at, learn what you're missing, and collaborate peer-to-peer across departments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (!user) {
                alert('Please sign in or register to post a skill exchange listing.');
                navigate('/login');
                return;
              }
              setShowCreateModal(true);
            }}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef233c, #b81428)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
            }}
          >
            <Plus size={16} /> Post Skill Listing
          </button>

          <div style={{
            display: 'flex',
            background: 'rgba(24, 24, 27, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px',
            borderRadius: '12px',
            gap: '4px',
          }}>
            <button
              onClick={() => setActiveTab('marketplace')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'marketplace' ? '#ef233c' : 'transparent',
                color: activeTab === 'marketplace' ? '#FFFFFF' : '#a1a1aa',
                boxShadow: activeTab === 'marketplace' ? '0 0 14px rgba(239, 35, 60, 0.45)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'requests' ? '#ef233c' : 'transparent',
                color: activeTab === 'requests' ? '#FFFFFF' : '#a1a1aa',
                boxShadow: activeTab === 'requests' ? '0 0 14px rgba(239, 35, 60, 0.45)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              My Activity
            </button>
          </div>
        </div>
      </div>

      {feedback && (
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
          <span>{feedback}</span>
        </div>
      )}

      {/* TAB 1: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div>
          {/* Search & Filter Bar */}
          <div style={{
            background: 'rgba(14, 14, 18, 0.75)',
            backdropFilter: 'blur(12px)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '2rem',
          }}>
            <div style={{ flex: '1 1 260px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search skills (e.g. React, CAD, Interview Prep, AWS)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
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

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['all', 'offer', 'request'].map((t) => {
                const isSelected = filterType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    style={{
                      padding: '0.65rem 1.1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? '#ef233c' : 'rgba(255, 255, 255, 0.1)'}`,
                      background: isSelected ? 'rgba(239, 35, 60, 0.15)' : 'rgba(24, 24, 27, 0.8)',
                      color: isSelected ? '#fca5a5' : '#a1a1aa',
                      boxShadow: isSelected ? '0 0 12px rgba(239, 35, 60, 0.3)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t === 'all' ? 'All Listings' : t === 'offer' ? 'Skills Offered (Teach)' : 'Skills Requested (Learn)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listings Cards Grid */}
          {listings.length === 0 ? (
            <div style={{
              background: 'rgba(14, 14, 18, 0.75)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <Repeat size={40} color="#ef233c" style={{ marginBottom: '1rem' }} />
              <h3 className="font-manrope" style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>No skill exchange listings yet</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>Be the first student to post an offer or request!</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}>
              {listings.map((item) => (
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
                  <div>
                    {/* Header: Type Pill & Peer Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: item.type === 'offer' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: item.type === 'offer' ? '#34D399' : '#fde047',
                        border: `1px solid ${item.type === 'offer' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                      }}>
                        {item.type === 'offer' ? 'Offering to Teach' : 'Seeking to Learn'}
                      </span>

                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#6ee7b7',
                        background: 'rgba(16, 185, 129, 0.12)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                      }}>
                        Free Campus Exchange
                      </span>
                    </div>

                    <h3 className="font-manrope" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
                      {item.skill_name}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Poster info & Action */}
                  <div style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {item.user_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        {item.user_department || 'Student'} • {item.user_college || 'Campus'}
                      </div>
                    </div>

                    {!item.is_owner ? (
                      <button
                        onClick={() => {
                          if (!user) {
                            alert('Please sign in or register to connect with peers.');
                            navigate('/login');
                            return;
                          }
                          setRequestTargetListing(item);
                          setRequestMessage('');
                        }}
                        style={{
                          padding: '0.55rem 1.15rem',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #ef233c, #b81428)',
                          color: '#FFFFFF',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 0 14px rgba(239, 35, 60, 0.4)',
                        }}
                      >
                        <span>Connect</span>
                        <Send size={13} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#71717a', fontWeight: 600 }}>
                        Your Listing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ACTIVITY (SENT & RECEIVED REQUESTS) */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Incoming Requests on my listings */}
          <div style={{
            background: 'rgba(14, 14, 18, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(24, 24, 27, 0.8)' }}>
              <h3 className="font-manrope" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Incoming Requests (From other students wanting to learn from you)
              </h3>
            </div>

            {myRequests.received?.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#a1a1aa', fontSize: '0.9rem' }}>
                No incoming exchange requests yet.
              </div>
            ) : (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myRequests.received.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '12px',
                      background: 'rgba(24, 24, 27, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {req.requester_name} wants to collaborate on: <strong style={{ color: '#ef233c' }}>{req.skill_name}</strong>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#d4d4d8', margin: '0.2rem 0' }}>
                        "{req.message || 'No message attached.'}"
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        College: {req.requester_college || 'Campus'} • Status: <strong style={{ textTransform: 'capitalize', color: '#FFFFFF' }}>{req.status}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'accepted')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#10B981',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'rgba(239, 35, 60, 0.2)',
                              color: '#fca5a5',
                              border: '1px solid rgba(239, 35, 60, 0.4)',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {req.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'completed')}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #ef233c, #b81428)',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 0 14px rgba(239, 35, 60, 0.4)',
                          }}
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests sent by me */}
          <div style={{
            background: 'rgba(14, 14, 18, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(24, 24, 27, 0.8)' }}>
              <h3 className="font-manrope" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Sent Requests (Learning invitations you sent)
              </h3>
            </div>

            {myRequests.sent?.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#a1a1aa', fontSize: '0.9rem' }}>
                You have not sent any exchange requests yet.
              </div>
            ) : (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myRequests.sent.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '12px',
                      background: 'rgba(24, 24, 27, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Requested: <strong style={{ color: '#ef233c' }}>{req.skill_name}</strong> from {req.owner_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
                        Status: <strong style={{ textTransform: 'capitalize', color: '#d4d4d8' }}>{req.status}</strong>
                      </div>
                    </div>
                    {req.status === 'completed' && (
                      <button
                        onClick={() => setReviewTargetUser({ id: req.owner_id, name: req.owner_name })}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #ef233c, #b81428)',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 0 14px rgba(239, 35, 60, 0.4)',
                        }}
                      >
                        Rate Peer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: POST LISTING */}
      {showCreateModal && (
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
            maxWidth: '500px',
            padding: '2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 35px rgba(239, 35, 60, 0.18)',
            color: '#f4f4f5',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef233c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Community Exchange
                </span>
                <h2 className="font-manrope" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0 0 0' }}>
                  Post a Skill Listing
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
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

            <form onSubmit={handleCreateListing}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Listing Type
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${newListing.type === 'offer' ? '#ef233c' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: newListing.type === 'offer' ? 'rgba(239, 35, 60, 0.15)' : 'rgba(24, 24, 27, 0.8)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: newListing.type === 'offer' ? '#FFFFFF' : '#a1a1aa',
                  }}>
                    <input
                      type="radio"
                      name="type"
                      checked={newListing.type === 'offer'}
                      onChange={() => setNewListing({ ...newListing, type: 'offer' })}
                    />
                    Teach a Skill (Offer)
                  </label>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${newListing.type === 'request' ? '#ef233c' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: newListing.type === 'request' ? 'rgba(239, 35, 60, 0.15)' : 'rgba(24, 24, 27, 0.8)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: newListing.type === 'request' ? '#FFFFFF' : '#a1a1aa',
                  }}>
                    <input
                      type="radio"
                      name="type"
                      checked={newListing.type === 'request'}
                      onChange={() => setNewListing({ ...newListing, type: 'request' })}
                    />
                    Learn a Skill (Request)
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Skill Name / Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SolidWorks 3D Modeling, React Native, UI Design in Figma..."
                  value={newListing.skill_name}
                  onChange={(e) => setNewListing({ ...newListing, skill_name: e.target.value })}
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
                  Description & What to Expect
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what you will cover, your experience level, or specific questions you need help with..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
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
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '0.7rem 1.4rem',
                    background: 'rgba(24, 24, 27, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    fontWeight: 600,
                    color: '#a1a1aa',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '0.7rem 1.6rem',
                    background: 'linear-gradient(135deg, #ef233c, #b81428)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: creating ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
                  }}
                >
                  {creating ? 'Posting...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONNECT / SEND REQUEST */}
      {requestTargetListing && (
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
            maxWidth: '480px',
            padding: '2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 35px rgba(239, 35, 60, 0.18)',
            color: '#f4f4f5',
          }}>
            <h2 className="font-manrope" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
              Connect with {requestTargetListing.user_name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: '0 0 1.25rem 0' }}>
              Regarding: <strong style={{ color: '#ef233c' }}>{requestTargetListing.skill_name}</strong>
            </p>

            <form onSubmit={handleSendExchangeRequest}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Your Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Hey, I saw your listing! I'd love to connect for a 45-min peer tutoring session this weekend..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
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
                  onClick={() => setRequestTargetListing(null)}
                  style={{
                    padding: '0.7rem 1.4rem',
                    background: 'rgba(24, 24, 27, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    fontWeight: 600,
                    color: '#a1a1aa',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingRequest}
                  style={{
                    padding: '0.7rem 1.6rem',
                    background: 'linear-gradient(135deg, #ef233c, #b81428)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: sendingRequest ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
                  }}
                >
                  {sendingRequest ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SkillExchangeRoutes = () => (
  <Routes>
    <Route index element={<SkillExchangeModule />} />
  </Routes>
);

export default SkillExchangeRoutes;
