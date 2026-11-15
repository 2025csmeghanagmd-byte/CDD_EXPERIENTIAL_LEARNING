import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { placementAPI } from '../../services/api';
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  BarChart3
} from 'lucide-react';

const PlacementModule = () => {
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'practice' | 'history'
  const [categories, setCategories] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAnswerForQ, setShowAnswerForQ] = useState({});
  const [practiceAnswers, setPracticeAnswers] = useState({});

  // Active Mock Test state
  const [activeTest, setActiveTest] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [testResult, setTestResult] = useState(null);
  const [submittingTest, setSubmittingTest] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  // Timer effect for active test
  useEffect(() => {
    if (!activeTest || testResult) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTest, timeLeft, testResult]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catRes, testRes] = await Promise.all([
        placementAPI.getCategories(),
        placementAPI.getMockTests(),
      ]);
      setCategories(catRes.data?.data?.categories || catRes.data?.categories || []);
      setMockTests(testRes.data?.data?.mock_tests || testRes.data?.mock_tests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPracticeQuestions = async (catId) => {
    setSelectedCategory(catId);
    setLoading(true);
    try {
      const res = await placementAPI.getQuestions({ category_id: catId });
      setQuestions(res.data?.data?.questions || res.data?.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await placementAPI.getMyResults();
      setHistory(res.data?.data?.results || res.data?.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startMockTest = async (testId) => {
    setLoading(true);
    try {
      const res = await placementAPI.getMockTestDetail(testId);
      const test = res.data?.data?.mock_test || res.data?.mock_test;
      setActiveTest(test);
      setCurrentQIndex(0);
      setUserAnswers({});
      setTestResult(null);
      setTimeLeft((test.duration_minutes || 20) * 60);
    } catch (err) {
      alert('Failed to start mock test.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionLetter) => {
    setUserAnswers((prev) => ({
      ...prev,
      [String(questionId)]: optionLetter,
    }));
  };

  const handleSelectPracticeOption = (questionId, letter) => {
    setPracticeAnswers((prev) => ({
      ...prev,
      [questionId]: letter,
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    setSubmittingTest(true);
    try {
      const totalTime = (activeTest.duration_minutes || 20) * 60;
      const timeSpent = totalTime - timeLeft;
      const res = await placementAPI.submitTest(activeTest.id, {
        answers: userAnswers,
        time_taken: timeSpent > 0 ? timeSpent : 60,
      });
      setTestResult(res.data?.data || res.data);
    } catch (err) {
      // Fallback local evaluation if backend requires auth and user is guest
      const total = activeTest.questions?.length || 1;
      let score = 0;
      const breakdown = (activeTest.questions || []).map((q) => {
        const userChoice = userAnswers[String(q.id)] || '';
        const correct = q.correct_answer || 'A';
        const isCorrect = userChoice.toUpperCase() === correct.toUpperCase();
        if (isCorrect) score += 1;
        return {
          question_id: q.id,
          question: q.question,
          user_answer: userChoice,
          correct_answer: correct,
          is_correct: isCorrect,
          explanation: q.explanation || 'Reviewed against curriculum answer key.',
        };
      });
      setTestResult({
        title: activeTest.title,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        breakdown,
      });
    } finally {
      setSubmittingTest(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // RENDER ACTIVE TEST TAKING SCREEN
  if (activeTest && !testResult) {
    const currentQ = activeTest.questions?.[currentQIndex];
    const totalQ = activeTest.questions?.length || 0;

    return (
      <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Top Floating Bar */}
        <div style={{
          background: 'rgba(14, 14, 18, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#ef233c',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Live Assessment
            </span>
            <h2 className="font-manrope" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0 0 0' }}>
              {activeTest.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              background: timeLeft < 180 ? 'rgba(239, 35, 60, 0.25)' : 'rgba(24, 24, 27, 0.9)',
              color: timeLeft < 180 ? '#ef233c' : '#fca5a5',
              border: `1px solid ${timeLeft < 180 ? 'rgba(239, 35, 60, 0.5)' : 'rgba(239, 35, 60, 0.25)'}`,
              fontWeight: 700,
              fontSize: '1.1rem',
              fontVariantNumeric: 'tabular-nums',
              boxShadow: timeLeft < 180 ? '0 0 16px rgba(239, 35, 60, 0.4)' : 'none',
            }}>
              <Clock size={18} color="#ef233c" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={handleSubmitTest}
              disabled={submittingTest}
              style={{
                padding: '0.65rem 1.35rem',
                background: 'linear-gradient(135deg, #ef233c, #b81428)',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                border: 'none',
                cursor: submittingTest ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
              }}
            >
              {submittingTest ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>

        {/* Question Card */}
        {currentQ ? (
          <div style={{
            background: 'rgba(14, 14, 18, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#d4d4d8',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                Question {currentQIndex + 1} of {totalQ}
              </span>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#fca5a5',
                background: 'rgba(239, 35, 60, 0.15)',
                border: '1px solid rgba(239, 35, 60, 0.3)',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {currentQ.difficulty || 'medium'}
              </span>
            </div>

            <h3 className="font-manrope" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {currentQ.question}
            </h3>

            {/* Options A, B, C, D */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {[
                { letter: 'A', text: currentQ.option_a },
                { letter: 'B', text: currentQ.option_b },
                { letter: 'C', text: currentQ.option_c },
                { letter: 'D', text: currentQ.option_d },
              ].filter(opt => Boolean(opt.text)).map((opt) => {
                const isSelected = userAnswers[String(currentQ.id)] === opt.letter;
                return (
                  <button
                    type="button"
                    key={opt.letter}
                    onClick={() => handleSelectOption(currentQ.id, opt.letter)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      border: `1.5px solid ${isSelected ? '#ef233c' : 'rgba(255, 255, 255, 0.08)'}`,
                      background: isSelected ? 'rgba(239, 35, 60, 0.16)' : 'rgba(24, 24, 27, 0.6)',
                      boxShadow: isSelected ? '0 0 18px rgba(239, 35, 60, 0.28)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                    }}
                  >
                    {/* Radio circle */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#ef233c' : 'rgba(255, 255, 255, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isSelected && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#ef233c',
                          boxShadow: '0 0 8px #ef233c',
                        }} />
                      )}
                    </div>

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected ? '#ef233c' : 'rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0,
                      boxShadow: isSelected ? '0 0 10px rgba(239, 35, 60, 0.6)' : 'none',
                    }}>
                      {opt.letter}
                    </div>
                    <span style={{ fontSize: '0.92rem', color: isSelected ? '#FFFFFF' : '#d4d4d8', fontWeight: isSelected ? 600 : 400 }}>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => prev - 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: 'rgba(24, 24, 27, 0.8)',
                  color: currentQIndex === 0 ? '#52525b' : '#d4d4d8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: currentQIndex === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                <ChevronLeft size={18} /> Previous
              </button>

              {currentQIndex < totalQ - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQIndex((prev) => prev + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.35rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ef233c, #b81428)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
                  }}
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.6rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ef233c, #b81428)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800,
                    boxShadow: '0 0 20px rgba(239, 35, 60, 0.5)',
                  }}
                >
                  Finish & Submit <CheckCircle2 size={18} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#a1a1aa' }}>No questions found in this assessment.</div>
        )}
      </div>
    );
  }

  // RENDER TEST RESULT SCORECARD SCREEN
  if (testResult) {
    return (
      <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Scorecard Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #140b0e 0%, #0d0d12 100%)',
          borderRadius: '24px',
          padding: '2.5rem',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.7), 0 0 35px rgba(239, 35, 60, 0.2)',
          border: '1px solid rgba(239, 35, 60, 0.35)',
          marginBottom: '2rem',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            background: 'rgba(239, 35, 60, 0.15)',
            border: '1px solid rgba(239, 35, 60, 0.3)',
            color: '#fca5a5',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem',
          }}>
            <Award size={15} color="#ef233c" /> Assessment Completed
          </span>

          <h2 className="font-manrope" style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#FFFFFF' }}>
            {testResult.title || 'Placement Mock Test'}
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: '0.5rem',
            margin: '1.5rem 0',
          }}>
            <span style={{ fontSize: '4.8rem', fontWeight: 900, color: '#ef233c', lineHeight: 1, textShadow: '0 0 25px rgba(239, 35, 60, 0.55)' }}>
              {testResult.score}
            </span>
            <span style={{ fontSize: '2rem', color: '#71717a', fontWeight: 600 }}>
              / {testResult.total}
            </span>
          </div>

          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.75rem' }}>
            Overall Performance: <span style={{ color: '#ef233c' }}>{testResult.percentage}%</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => {
                setActiveTest(null);
                setTestResult(null);
                setActiveTab('tests');
              }}
              style={{
                padding: '0.75rem 1.6rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef233c, #b81428)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
              }}
            >
              Take Another Test
            </button>
            <button
              onClick={() => {
                setActiveTest(null);
                setTestResult(null);
                setActiveTab('history');
              }}
              style={{
                padding: '0.75rem 1.6rem',
                borderRadius: '10px',
                background: 'rgba(24, 24, 27, 0.8)',
                color: '#d4d4d8',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
              }}
            >
              View Test History
            </button>
          </div>
        </div>

        {/* Detailed Solutions Breakdown */}
        <h3 className="font-manrope" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' }}>
          Detailed Solutions & Answers Key
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(testResult.breakdown || []).map((b, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(14, 14, 18, 0.75)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: `1px solid ${b.is_correct ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 35, 60, 0.35)'}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <h4 className="font-manrope" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
                  {idx + 1}. {b.question}
                </h4>
                {b.is_correct ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#34D399', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={18} /> Correct (+1)
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem' }}>
                    <XCircle size={18} /> Incorrect (0)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.88rem', margin: '0.75rem 0' }}>
                <div>
                  <span style={{ color: '#a1a1aa' }}>Your choice: </span>
                  <strong style={{ color: b.is_correct ? '#34D399' : '#fca5a5' }}>
                    Option {b.user_answer || 'None'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#a1a1aa' }}>Correct answer: </span>
                  <strong style={{ color: '#34D399' }}>Option {b.correct_answer}</strong>
                </div>
              </div>

              {b.explanation && (
                <div style={{
                  background: 'rgba(24, 24, 27, 0.8)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.85rem',
                  color: '#d4d4d8',
                  lineHeight: 1.5,
                  marginTop: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                  <strong style={{ color: '#ef233c' }}>Explanation: </strong>
                  {b.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // DEFAULT DASHBOARD / MAIN SCREEN
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
              <GraduationCap size={14} color="#ef233c" /> Member 3 Module
            </span>
          </div>
          <h1 className="font-manrope" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            Placement Preparation & Mock Tests
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#a1a1aa', margin: '0.35rem 0 0 0' }}>
            Practice Aptitude, DSA, Core Engineering (Mech, ECE, Civil), and take timed placement assessments.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          background: 'rgba(24, 24, 27, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '4px',
          borderRadius: '12px',
          gap: '4px',
        }}>
          {[
            { id: 'tests', label: 'Mock Assessments' },
            { id: 'practice', label: 'Domain Question Bank' },
            { id: 'history', label: 'Test History' },
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

      {/* TAB 1: MOCK ASSESSMENTS */}
      {activeTab === 'tests' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}>
          {mockTests.map((test) => (
            <div
              key={test.id}
              style={{
                background: 'rgba(14, 14, 18, 0.75)',
                backdropFilter: 'blur(12px)',
                borderRadius: '18px',
                padding: '1.75rem',
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
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(239, 35, 60, 0.12)',
                  border: '1px solid rgba(239, 35, 60, 0.25)',
                  color: '#fca5a5',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                }}>
                  {test.category_name || 'All-Domain Technical'}
                </div>
                <h3 className="font-manrope" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
                  {test.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                  {test.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#d4d4d8', marginBottom: '1.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={15} color="#ef233c" /> {test.duration_minutes || 25} mins
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <BookOpen size={15} color="#fca5a5" /> {test.total_questions || 10} MCQs
                  </span>
                </div>
              </div>

              <button
                onClick={() => startMockTest(test.id)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef233c, #b81428)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 0 16px rgba(239, 35, 60, 0.4)',
                }}
              >
                <span>Start Assessment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: DOMAIN QUESTION BANK */}
      {activeTab === 'practice' && (
        <div>
          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {categories.map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => fetchPracticeQuestions(c.id)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 700 : 500,
                    border: `1.5px solid ${isSelected ? '#ef233c' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: isSelected ? 'rgba(239, 35, 60, 0.15)' : 'rgba(24, 24, 27, 0.8)',
                    color: isSelected ? '#fca5a5' : '#a1a1aa',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 12px rgba(239, 35, 60, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Question List */}
          {questions.length === 0 ? (
            <div style={{
              background: 'rgba(14, 14, 18, 0.75)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <BookOpen size={36} color="#ef233c" style={{ marginBottom: '0.75rem' }} />
              <h3 className="font-manrope" style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0 }}>
                Select a category above to load curated interview questions
              </h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {questions.map((q, idx) => {
                const showExpl = showAnswerForQ[q.id];
                const userChoice = practiceAnswers[q.id];
                const hasAnswered = Boolean(userChoice);

                return (
                  <div
                    key={q.id}
                    style={{
                      background: 'rgba(14, 14, 18, 0.75)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      padding: '1.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef233c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Question {idx + 1}
                      </span>
                      <span style={{
                        fontSize: '0.78rem',
                        color: '#fca5a5',
                        background: 'rgba(239, 35, 60, 0.15)',
                        border: '1px solid rgba(239, 35, 60, 0.25)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        textTransform: 'capitalize'
                      }}>
                        {q.difficulty}
                      </span>
                    </div>

                    <h4 className="font-manrope" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 1rem 0' }}>
                      {q.question}
                    </h4>

                    {/* Interactive MCQ Option Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      {['A', 'B', 'C', 'D'].map((letter) => {
                        const optText = q[`option_${letter.toLowerCase()}`];
                        if (!optText) return null;

                        const isThisSelected = userChoice === letter;
                        const isCorrectAnswer = q.correct_answer === letter;

                        let borderStyle = '1px solid rgba(255, 255, 255, 0.08)';
                        let bgStyle = 'rgba(24, 24, 27, 0.6)';
                        let textColor = '#d4d4d8';
                        let badgeBg = 'rgba(255, 255, 255, 0.08)';
                        let badgeColor = '#FFFFFF';

                        if (hasAnswered) {
                          if (isCorrectAnswer) {
                            borderStyle = '1.5px solid #10B981';
                            bgStyle = 'rgba(16, 185, 129, 0.18)';
                            textColor = '#34D399';
                            badgeBg = '#10B981';
                            badgeColor = '#FFFFFF';
                          } else if (isThisSelected) {
                            borderStyle = '1.5px solid #ef233c';
                            bgStyle = 'rgba(239, 35, 60, 0.18)';
                            textColor = '#fca5a5';
                            badgeBg = '#ef233c';
                            badgeColor = '#FFFFFF';
                          }
                        } else if (showExpl && isCorrectAnswer) {
                          borderStyle = '1.5px solid #10B981';
                          bgStyle = 'rgba(16, 185, 129, 0.18)';
                          textColor = '#34D399';
                          badgeBg = '#10B981';
                        }

                        return (
                          <button
                            type="button"
                            key={letter}
                            onClick={() => handleSelectPracticeOption(q.id, letter)}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '10px',
                              background: bgStyle,
                              border: borderStyle,
                              fontSize: '0.88rem',
                              color: textColor,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.15s ease',
                              outline: 'none',
                              boxShadow: isThisSelected ? (isCorrectAnswer ? '0 0 15px rgba(16, 185, 129, 0.3)' : '0 0 15px rgba(239, 35, 60, 0.3)') : 'none',
                            }}
                          >
                            <span style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              background: badgeBg,
                              color: badgeColor,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              flexShrink: 0,
                            }}>
                              {letter}
                            </span>
                            <span style={{ flex: 1, fontWeight: isThisSelected ? 600 : 400 }}>
                              {optText}
                            </span>
                            {hasAnswered && isCorrectAnswer && (
                              <CheckCircle2 size={18} color="#10B981" />
                            )}
                            {hasAnswered && isThisSelected && !isCorrectAnswer && (
                              <XCircle size={18} color="#ef233c" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback message upon answering */}
                    {hasAnswered && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        background: userChoice === q.correct_answer ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 35, 60, 0.12)',
                        border: `1px solid ${userChoice === q.correct_answer ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 35, 60, 0.3)'}`,
                        marginBottom: '0.85rem',
                        fontSize: '0.85rem',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: userChoice === q.correct_answer ? '#34D399' : '#fca5a5',
                          fontWeight: 600,
                        }}>
                          {userChoice === q.correct_answer ? (
                            <>
                              <CheckCircle2 size={16} color="#10B981" />
                              <span>Correct! Option {userChoice} is the right answer.</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} color="#ef233c" />
                              <span>Incorrect. Correct answer is <strong>Option {q.correct_answer}</strong>.</span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectPracticeOption(q.id, null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#a1a1aa',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowAnswerForQ((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        background: 'rgba(239, 35, 60, 0.15)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 35, 60, 0.3)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {showExpl ? 'Hide Explanation' : 'View Correct Answer & Explanation'}
                    </button>

                    {showExpl && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.85rem 1rem',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#d1fae5',
                      }}>
                        <strong style={{ color: '#34D399' }}>Answer: Option {q.correct_answer}</strong>
                        <p style={{ margin: '0.35rem 0 0 0', color: '#a7f3d0' }}>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEST HISTORY */}
      {activeTab === 'history' && (
        <div style={{
          background: 'rgba(14, 14, 18, 0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 className="font-manrope" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
              My Assessment Score Archive
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0 }}>
              Review past scores and monitor your placement preparedness trends.
            </p>
          </div>

          {history.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#a1a1aa' }}>
              <Award size={38} color="#ef233c" style={{ marginBottom: '0.75rem' }} />
              <div className="font-manrope" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>No mock assessments completed yet</div>
              <p style={{ fontSize: '0.88rem', margin: '0.3rem 0 1.25rem 0', color: '#71717a' }}>Take your first practice test to track your growth.</p>
              <button
                onClick={() => setActiveTab('tests')}
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
                Browse Mock Tests
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(24, 24, 27, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test Title</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Percentage</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => {
                    const pct = Math.round((h.score / (h.total || 1)) * 100);
                    return (
                      <tr key={h.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {h.test_title}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
                          {h.category_name || 'Technical'}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#ef233c' }}>
                          {h.score} / {h.total}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: pct >= 70 ? 'rgba(16, 185, 129, 0.15)' : pct >= 40 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 35, 60, 0.15)',
                            color: pct >= 70 ? '#34D399' : pct >= 40 ? '#fde047' : '#fca5a5',
                            border: `1px solid ${pct >= 70 ? 'rgba(16, 185, 129, 0.3)' : pct >= 40 ? 'rgba(234, 179, 8, 0.3)' : 'rgba(239, 35, 60, 0.3)'}`,
                          }}>
                            {pct}%
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: '#71717a' }}>
                          {h.completed_at ? String(h.completed_at).slice(0, 10) : 'Recent'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PlacementRoutes = () => (
  <Routes>
    <Route index element={<PlacementModule />} />
  </Routes>
);

export default PlacementRoutes;
