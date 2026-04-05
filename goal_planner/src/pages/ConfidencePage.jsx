import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ConfidencePage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingTopicId, setSavingTopicId] = useState(null);
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, [goalId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const goalRes = await axios.get(
        `${API_URL}/goals/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const goalData = goalRes.data.goal || goalRes.data;
      setGoal(goalData);

      const topicsRes = await axios.get(
        `${API_URL}/confidence/goal/${goalId}/topics`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const topicsData = Array.isArray(topicsRes.data) 
        ? topicsRes.data 
        : topicsRes.data.topics || [];

      console.log('Topics received:', topicsData);
      setTopics(topicsData);

    } catch (err) {
      console.error('Fetch data error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load confidence data. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getMasteryLevel = (confidence) => {
    if (confidence < 20) return { label: 'Learning', color: '#EF4444', bgColor: '#FEE2E2' };
    if (confidence < 40) return { label: 'Beginner', color: '#F97316', bgColor: '#FFEDD5' };
    if (confidence < 60) return { label: 'Intermediate', color: '#EAB308', bgColor: '#FEF3C7' };
    if (confidence < 80) return { label: 'Proficient', color: '#22C55E', bgColor: '#DCFCE7' };
    return { label: 'Expert', color: '#16A34A', bgColor: '#BBF7D0' };
  };

  const updateConfidence = async (topicId, newConfidence) => {
    setSavingTopicId(topicId);
    setSuccess('');

    try {
      await axios.post(
        `${API_URL}/confidence`,
        {
          goal_id: goalId,
          topic_id: topicId,
          confidence: newConfidence
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTopics(topics.map(t => 
        t.id === topicId ? { ...t, confidence: newConfidence } : t
      ));

      setSuccess('✓ Confidence updated!');
      setTimeout(() => setSuccess(''), 2000);

    } catch (err) {
      console.error('Update confidence error:', err);
      setError('Failed to update confidence. Try again.');
    } finally {
      setSavingTopicId(null);
    }
  };

  const calculateAverageConfidence = () => {
    if (topics.length === 0) return 0;
    const total = topics.reduce((sum, t) => sum + (t.confidence || 0), 0);
    return Math.round(total / topics.length);
  };

  const getStrongTopics = () => {
    return topics.filter(t => (t.confidence || 0) >= 75);
  };

  const getWeakTopics = () => {
    return topics.filter(t => (t.confidence || 0) < 60);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading confidence data...</p>
      </div>
    );
  }

  if (error && !goal) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: 'var(--color-text-danger)', margin: '0 0 1rem' }}>{error}</p>
          <button
            onClick={() => navigate('/goals')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-background-info)',
              color: 'var(--color-text-info)',
              border: '0.5px solid var(--color-border-info)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Back to Goals
          </button>
        </div>
      </div>
    );
  }

  const averageConfidence = calculateAverageConfidence();
  const strongTopics = getStrongTopics();
  const weakTopics = getWeakTopics();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate(`/goal/${goalId}`)}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer'
          }}
        >
          ← Back to Goal
        </button>

        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
            📚 Topic Confidence
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
            {goal?.name} - Update your mastery level for each topic
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'var(--color-background-danger)',
            border: '0.5px solid var(--color-border-danger)',
            color: 'var(--color-text-danger)',
            padding: '1rem',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: 'var(--color-background-success)',
            border: '0.5px solid var(--color-border-success)',
            color: 'var(--color-text-success)',
            padding: '1rem',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '2rem'
          }}>
            {success}
          </div>
        )}

        {/* Average Confidence Card */}
        <div style={{
          backgroundColor: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
            Average Confidence
          </p>
          <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--color-text-info)', margin: 0 }}>
            {averageConfidence}%
          </p>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginTop: '1rem'
          }}>
            <div style={{
              width: `${averageConfidence}%`,
              height: '100%',
              backgroundColor: '#3B82F6',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Topics List */}
        {topics.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {topics.map(topic => {
              const mastery = getMasteryLevel(topic.confidence || 0);
              return (
                <div
                  key={topic.id}
                  style={{
                    backgroundColor: 'var(--color-background-primary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem'
                  }}
                >
                  {/* Topic Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
                        {topic.name || topic.topic}
                      </h3>
                    </div>
                    <div style={{
                      backgroundColor: mastery.bgColor,
                      color: mastery.color,
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--border-radius-md)',
                      fontSize: '12px',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {mastery.label}
                    </div>
                  </div>

                  {/* Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={topic.confidence || 0}
                      onChange={(e) => updateConfidence(topic.id, parseInt(e.target.value))}
                      disabled={savingTopicId === topic.id}
                      style={{
                        flex: 1,
                        height: '6px',
                        borderRadius: '3px',
                        outline: 'none',
                        cursor: savingTopicId === topic.id ? 'not-allowed' : 'pointer',
                        opacity: savingTopicId === topic.id ? 0.7 : 1
                      }}
                    />
                    <div style={{
                      minWidth: '50px',
                      textAlign: 'right',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: mastery.color
                    }}>
                      {topic.confidence || 0}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--color-background-secondary)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${topic.confidence || 0}%`,
                      height: '100%',
                      backgroundColor: mastery.color,
                      transition: 'width 0.3s'
                    }} />
                  </div>

                  {/* Saving Indicator */}
                  {savingTopicId === topic.id && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
                      Saving...
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              No topics found for this goal
            </p>
          </div>
        )}

        {/* Summary Section */}
        {topics.length > 0 && (
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Strong Topics */}
            <div style={{
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
                💪 Strong Topics ({strongTopics.length})
              </h3>
              {strongTopics.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {strongTopics.map(topic => (
                    <div
                      key={topic.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: 'var(--color-background-secondary)',
                        borderRadius: 'var(--border-radius-md)'
                      }}
                    >
                      <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                        {topic.name || topic.topic}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#22C55E' }}>
                        {topic.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  No strong topics yet. Keep learning!
                </p>
              )}
            </div>

            {/* Weak Topics */}
            <div style={{
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
                ⚠️ Weak Topics ({weakTopics.length})
              </h3>
              {weakTopics.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {weakTopics.map(topic => (
                    <div
                      key={topic.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: 'var(--color-background-secondary)',
                        borderRadius: 'var(--border-radius-md)'
                      }}
                    >
                      <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                        {topic.name || topic.topic}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>
                        {topic.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Great! No weak topics. You're doing well!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Check Readiness Button */}
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => navigate(`/interview-readiness/${goalId}`)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'var(--color-background-warning)',
              color: 'var(--color-text-warning)',
              border: '0.5px solid var(--color-border-warning)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📋 Check Interview Readiness →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfidencePage;