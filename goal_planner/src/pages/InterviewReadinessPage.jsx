import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const InterviewReadinessPage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchReadinessData();
  }, [goalId]);

  const fetchReadinessData = async () => {
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

      const readinessRes = await axios.get(
        `${API_URL}/confidence/goal/${goalId}/readiness`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const readinessData = readinessRes.data.readiness || readinessRes.data;
      console.log('Readiness data:', readinessData);
      setReadiness(readinessData);

      const topicsRes = await axios.get(
        `${API_URL}/confidence/goal/${goalId}/topics`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const topicsData = Array.isArray(topicsRes.data) 
        ? topicsRes.data 
        : topicsRes.data.topics || [];

      setTopics(topicsData);

    } catch (err) {
      console.error('Fetch readiness error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load readiness data. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getTopicsByLevel = (topics) => {
    const strong = topics.filter(t => (t.confidence || 0) >= 75);
    const weak = topics.filter(t => (t.confidence || 0) < 60);
    const medium = topics.filter(t => (t.confidence || 0) >= 60 && (t.confidence || 0) < 75);

    return { strong, weak, medium };
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading readiness assessment...</p>
      </div>
    );
  }

  if (error || !readiness) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: 'var(--color-text-danger)', margin: '0 0 1rem' }}>{error}</p>
          <button
            onClick={() => navigate(`/confidence/${goalId}`)}
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
            Back to Confidence
          </button>
        </div>
      </div>
    );
  }

  const { strong, weak, medium } = getTopicsByLevel(topics);
  const isReady = (readiness.average_confidence || 0) >= 75;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate(`/confidence/${goalId}`)}
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
          ← Back to Confidence
        </button>

        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
            📋 Interview Readiness
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
            {goal?.name} - Are you ready for interviews?
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Readiness Badge */}
        <div style={{
          backgroundColor: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: isReady ? '#10B981' : '#F59E0B',
            color: '#FFFFFF',
            padding: '1.5rem 3rem',
            borderRadius: 'var(--border-radius-lg)',
            marginBottom: '1.5rem'
          }}>
            <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 0.5rem' }}>
              {readiness.average_confidence || 0}%
            </p>
            <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              {isReady ? '✅ READY FOR INTERVIEWS' : '⚠️ NEEDS MORE PREPARATION'}
            </p>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '1rem 0 0' }}>
            {isReady 
              ? 'Congratulations! You have mastered all topics at 75%+ confidence!' 
              : 'Focus on weak topics to improve your readiness score'}
          </p>
        </div>

        {/* Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Strong Topics
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: '#22C55E', margin: 0 }}>
              {strong.length}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
              {strong.length === topics.length ? 'All mastered!' : `${Math.round((strong.length / topics.length) * 100)}% of topics`}
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Medium Topics
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: '#EAB308', margin: 0 }}>
              {medium.length}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
              Need some practice
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Weak Topics
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: '#EF4444', margin: 0 }}>
              {weak.length}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
              Focus priority
            </p>
          </div>
        </div>

        {/* Topics Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Strong Topics */}
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem', color: '#22C55E' }}>
              💪 Strong Topics ({strong.length})
            </h3>
            {strong.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {strong.map(topic => (
                  <div
                    key={topic.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: 'var(--border-radius-md)',
                      borderLeft: '3px solid #22C55E'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                        {topic.name || topic.topic}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#22C55E' }}>
                        {topic.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                No strong topics yet
              </p>
            )}
          </div>

          {/* Medium Topics */}
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem', color: '#EAB308' }}>
              🟡 Medium Topics ({medium.length})
            </h3>
            {medium.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {medium.map(topic => (
                  <div
                    key={topic.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: 'var(--border-radius-md)',
                      borderLeft: '3px solid #EAB308'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                        {topic.name || topic.topic}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#EAB308' }}>
                        {topic.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                No medium topics
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem', color: '#EF4444' }}>
              ⚠️ Weak Topics ({weak.length})
            </h3>
            {weak.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {weak.map(topic => (
                  <div
                    key={topic.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: 'var(--border-radius-md)',
                      borderLeft: '3px solid #EF4444'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                        {topic.name || topic.topic}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>
                        {topic.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--color-text-success)', margin: 0, fontWeight: '600' }}>
                ✅ No weak topics!
              </p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div style={{
          backgroundColor: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
            📝 Recommendations
          </h3>
          <ul style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            margin: 0,
            paddingLeft: '1.5rem',
            lineHeight: '1.8'
          }}>
            {weak.length > 0 && (
              <li>
                <strong>Priority:</strong> Focus on <strong>{weak.map(t => t.name || t.topic).join(', ')}</strong> topics. 
                They are crucial for interview success.
              </li>
            )}
            {medium.length > 0 && (
              <li>
                <strong>Practice:</strong> Solve more practice problems for <strong>{medium.map(t => t.name || t.topic).join(', ')}</strong> topics.
              </li>
            )}
            {isReady ? (
              <li>
                <strong>Excellent!</strong> You're well-prepared for interviews. Continue practicing to maintain your level.
              </li>
            ) : (
              <li>
                <strong>Target:</strong> Aim to get all topics to 75%+ confidence before your interviews.
              </li>
            )}
            <li>
              Use the <strong>Resources page</strong> to find YouTube videos and materials for weak topics.
            </li>
            <li>
              Track your progress regularly and update confidence levels as you improve.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate(`/confidence/${goalId}`)}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text-info)',
              border: '0.5px solid var(--color-border-info)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ← Update Confidence
          </button>
          <button
            onClick={() => navigate(`/goal/${goalId}`)}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: 'var(--color-background-info)',
              color: 'var(--color-text-info)',
              border: '0.5px solid var(--color-border-info)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            View Roadmap →
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewReadinessPage;