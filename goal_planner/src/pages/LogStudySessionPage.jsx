import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const LogStudySessionPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [duration, setDuration] = useState(25);
  const [topic, setTopic] = useState('');
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch goals
  useEffect(() => {
    fetchGoals();
  }, []);

  // Update topics when goal changes
  useEffect(() => {
    if (selectedGoalId) {
      fetchTopicsForGoal(selectedGoalId);
    }
  }, [selectedGoalId]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/goals`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const goalsData = Array.isArray(res.data) ? res.data : res.data.goals || [];
      setGoals(goalsData);

      if (goalsData.length > 0) {
        setSelectedGoalId(goalsData[0].id);
      }

    } catch (err) {
      console.error('Fetch goals error:', err);
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsForGoal = async (goalId) => {
    try {
      const res = await axios.get(
        `${API_URL}/confidence/goal/${goalId}/topics`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const topicsData = Array.isArray(res.data) ? res.data : res.data.topics || [];
      setTopics(topicsData);

      if (topicsData.length > 0 && !topic) {
        setTopic(topicsData[0].name || topicsData[0].topic);
      }

    } catch (err) {
      console.error('Fetch topics error:', err);
      // Topics are optional, don't block
      setTopics([]);
    }
  };

  // Calculate pomodoros
  const calculatePomodoros = (minutes) => {
    return Math.round(minutes / 25);
  };

  // Submit study session
  const handleSubmitSession = async (e) => {
    e.preventDefault();

    if (!selectedGoalId || !duration || duration < 1) {
      setError('Please select a goal and enter valid duration');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const pomodoros = calculatePomodoros(duration);

      const response = await axios.post(
        `${API_URL}/study-sessions`,
        {
          goal_id: selectedGoalId,
          duration_minutes: duration,
          topic: topic || null,
          pomodoros_completed: pomodoros
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Study session logged:', response.data);

      // Show success message
      setSuccess(`✅ ${pomodoros} pomodoro${pomodoros !== 1 ? 's' : ''} logged! Great work! 🔥`);

      // Reset form
      setTimeout(() => {
        setDuration(25);
        setTopic('');
        setSuccess('');
        navigate('/tasks');
      }, 2000);

    } catch (err) {
      console.error('Submit session error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to log session. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  const pomodoros = calculatePomodoros(duration);
  const selectedGoal = goals.find(g => g.id === parseInt(selectedGoalId));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate('/tasks')}
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
          ← Back to Tasks
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
          📊 Log Study Session
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
          Track your study time with Pomodoro technique (25 min = 1 pomodoro)
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        
        <form onSubmit={handleSubmitSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Select Goal */}
          <div style={{ backgroundColor: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-tertiary)', padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
              Select Goal *
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-secondary)',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
              required
            >
              <option value="">-- Select a goal --</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Topic */}
          {topics.length > 0 && (
            <div style={{ backgroundColor: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-tertiary)', padding: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                Select Topic (Optional)
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-background-secondary)',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- No specific topic --</option>
                {topics.map((t, idx) => (
                  <option key={idx} value={t.name || t.topic}>
                    {t.name || t.topic}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Duration Input */}
          <div style={{ backgroundColor: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-tertiary)', padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
              Study Duration (Minutes) *
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              max="600"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-secondary)',
                boxSizing: 'border-box'
              }}
              required
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
              Enter study duration in minutes
            </p>
          </div>

          {/* Pomodoro Calculator */}
          <div style={{ backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', border: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
                Study Duration
              </p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-info)', margin: 0 }}>
                {duration} min
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ height: '2px', flex: 1, backgroundColor: 'var(--color-border-tertiary)' }}></div>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>equals</span>
              <div style={{ height: '2px', flex: 1, backgroundColor: 'var(--color-border-tertiary)' }}></div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
                Pomodoros
              </p>
              <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--color-text-warning)', margin: 0 }}>
                {pomodoros}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
                1 pomodoro = 25 minutes
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              backgroundColor: 'var(--color-background-danger)',
              border: '0.5px solid var(--color-border-danger)',
              color: 'var(--color-text-danger)',
              padding: '1rem',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: 'var(--color-background-success)',
              border: '0.5px solid var(--color-border-success)',
              color: 'var(--color-text-success)',
              padding: '1rem',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !selectedGoalId}
            style={{
              padding: '1rem',
              backgroundColor: submitting ? 'var(--color-background-secondary)' : 'var(--color-background-info)',
              color: submitting ? 'var(--color-text-secondary)' : 'var(--color-text-info)',
              border: `0.5px solid ${submitting ? 'var(--color-border-secondary)' : 'var(--color-border-info)'}`,
              borderRadius: 'var(--border-radius-md)',
              fontSize: '16px',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? 'Logging session...' : `Log ${pomodoros} Pomodoro${pomodoros !== 1 ? 's' : ''} 🔥`}
          </button>
        </form>

        {/* Info Box */}
        <div style={{
          backgroundColor: 'var(--color-background-primary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '0.5px solid var(--color-border-tertiary)',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
            ⏱️ About Pomodoro Technique
          </h3>
          <ul style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li>1 Pomodoro = 25 minutes of focused study</li>
            <li>Short breaks between sessions improve productivity</li>
            <li>Track your pomodoros to build consistency</li>
            <li>Complete 4 pomodoros = 1 long break (15 min)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogStudySessionPage;