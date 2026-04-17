import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [studyHours, setStudyHours] = useState([]);
  const [confidenceData, setConfidenceData] = useState([]);
  const [taskCompletion, setTaskCompletion] = useState([]);
  const [stats, setStats] = useState({ hours: 0, sessions: 0, avgPomodoros: 0, taskCompleted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAnalyticsData();
  }, [goalId]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    try {
      const goalRes = await axios.get(`${API_URL}/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoal(goalRes.data.goal || goalRes.data);

      const sessionsRes = await axios.get(`${API_URL}/study-sessions/goal/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sessions = Array.isArray(sessionsRes.data) ? sessionsRes.data : sessionsRes.data.sessions || [];

      const hoursMap = {};
      let totalHours = 0;
      let totalSessions = 0;
      let totalPomodoros = 0;

      sessions.forEach(session => {
        const date = new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        hoursMap[date] = (hoursMap[date] || 0) + (session.duration_minutes || 0) / 60;
        totalHours += session.duration_minutes || 0;
        totalSessions += 1;
        totalPomodoros += session.pomodoros_completed || 0;
      });

      const studyData = Object.entries(hoursMap).map(([date, hours]) => ({
        date,
        hours: parseFloat(hours.toFixed(2))
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      setStudyHours(studyData);

      try {
        const confidenceRes = await axios.get(`${API_URL}/analytics/confidence/${goalId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const confData = confidenceRes.data.chartData || [];
        setConfidenceData(confData);
      } catch (err) {
        console.error('Confidence fetch error:', err);
      }

      try {
        const tasksRes = await axios.get(`${API_URL}/tasks/goal/${goalId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let tasks = [];
        if (Array.isArray(tasksRes.data)) {
          tasks = tasksRes.data;
        } else if (tasksRes.data.tasks && Array.isArray(tasksRes.data.tasks)) {
          tasks = tasksRes.data.tasks;
        }
        
        const completed = tasks.filter(t => t.completed === true).length;
        const total = tasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        let chartData = [];
        if (total > 0) {
          chartData = [
            { name: 'Completed', value: completed },
            { name: 'Pending', value: total - completed }
          ];
        }
        
        setTaskCompletion(chartData);

        setStats(prev => ({
          ...prev,
          taskCompleted: percentage
        }));
      } catch (err) {
        console.error('Tasks fetch error:', err);
      }

      setStats(prev => ({
        ...prev,
        hours: (totalHours / 60).toFixed(1),
        sessions: totalSessions,
        avgPomodoros: totalSessions > 0 ? (totalPomodoros / totalSessions).toFixed(1) : 0
      }));

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#E5E7EB'];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background-tertiary)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/analytics')}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ← Back to Goals
          </button>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 0.5rem',
            color: 'var(--color-text-primary)'
          }}>
            📊 Analytics: {goal?.name || 'Goal'}
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: 0
          }}>
            Track your learning progress and performance
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--color-background-danger)',
            border: '1px solid var(--color-border-danger)',
            color: 'var(--color-text-danger)',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Total Study Hours */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 0.75rem'
            }}>
              Total Study Hours
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              {stats.hours}h
            </p>
          </div>

          {/* Study Sessions */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 0.75rem'
            }}>
              Study Sessions
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              {stats.sessions}
            </p>
          </div>

          {/* Avg Pomodoros */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 0.75rem'
            }}>
              Avg Pomodoros/Session
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              {stats.avgPomodoros}
            </p>
          </div>

          {/* Task Completion */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 0.75rem'
            }}>
              Task Completion
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #EC4899, #DB2777)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              {stats.taskCompleted}%
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          
          {/* Study Hours Chart */}
          {studyHours.length > 0 && (
            <div style={{
              backgroundColor: 'var(--color-background-primary)',
              border: '1px solid var(--color-border-tertiary)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 1.5rem',
                color: 'var(--color-text-primary)'
              }}>
                📈 Study Hours Over Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studyHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
                  <YAxis stroke="var(--color-text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-background-secondary)',
                      border: '1px solid var(--color-border-tertiary)',
                      borderRadius: '8px',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Confidence Chart */}
          {confidenceData.length > 0 && (
            <div style={{
              backgroundColor: 'var(--color-background-primary)',
              border: '1px solid var(--color-border-tertiary)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 1.5rem',
                color: 'var(--color-text-primary)'
              }}>
                💪 Confidence by Topic
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
                  <YAxis domain={[0, 100]} stroke="var(--color-text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-background-secondary)',
                      border: '1px solid var(--color-border-tertiary)',
                      borderRadius: '8px',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="confidence" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate(`/export/${goalId}`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            📥 Export Data
          </button>

          <button
            onClick={() => navigate(`/progress-check/${goalId}`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            📊 Check Progress
          </button>

          <button
            onClick={() => navigate(`/suggestions/${goalId}`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #EC4899, #DB2777)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)';
            }}
          >
            💡 Get Suggestions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;