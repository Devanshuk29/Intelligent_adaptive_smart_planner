import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const DashboardPage = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [todayStudy, setTodayStudy] = useState(0);
  const [weekStudy, setWeekStudy] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      
      try {
        const goalsRes = await axios.get(`${API_URL}/goals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const goalsData = Array.isArray(goalsRes.data) ? goalsRes.data : goalsRes.data.goals || [];
        setGoals(goalsData);
      } catch (err) {
        console.log('Goals endpoint not ready');
      }

      
      try {
        const sessionsRes = await axios.get(`${API_URL}/study-sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const sessions = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];
        
        if (sessions.length > 0) {
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0);

          const todaySessions = sessions.filter(s => {
            const sessionDate = new Date(s.created_at);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
          });

          const todayMinutes = todaySessions.reduce((sum, s) => sum + (parseInt(s.duration_minutes) || 0), 0);
          setTodayStudy((todayMinutes / 60).toFixed(1));

          const weekSessions = sessions.filter(s => {
            const sessionDate = new Date(s.created_at);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate >= weekAgo && sessionDate <= today;
          });

          const weekMinutes = weekSessions.reduce((sum, s) => sum + (parseInt(s.duration_minutes) || 0), 0);
          setWeekStudy((weekMinutes / 60).toFixed(1));
        }
      } catch (err) {
        console.log('Study sessions fetch error:', err.message);
      }

      try {
        const streakRes = await axios.get(`${API_URL}/streaks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (streakRes.data?.streak?.currentStreak !== undefined) {
          setStreak(streakRes.data.streak.currentStreak || 0);
        }
      } catch (err) {
        console.log('Streak fetch error:', err.message);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading dashboard...</p>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                margin: 0,
                color: 'var(--color-text-primary)',
                marginBottom: '0.5rem'
              }}>
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                margin: 0
              }}>
                Here's your learning progress overview
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-background-primary)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-tertiary)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
                e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background-primary)';
                e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Today's Study */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
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
              Today's Study
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              {todayStudy}h
            </p>
          </div>

          {/* This Week */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
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
              This Week
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
              {weekStudy}h
            </p>
          </div>

          {/* Current Streak */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
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
              Current Streak
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
              {streak} 🔥
            </p>
          </div>

          {/* Total Goals */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
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
              Active Goals
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
              {goals.length}
            </p>
          </div>
        </div>

        {/* Goals Section */}
        {goals.length > 0 && (
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 1.5rem',
              color: 'var(--color-text-primary)'
            }}>
              🎯 Your Goals
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {goals.map(goal => (
                <div
                  key={goal.id}
                  onClick={() => navigate(`/goal/${goal.id}`)}
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    border: '1px solid var(--color-border-tertiary)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                    margin: '0 0 0.5rem'
                  }}>
                    {goal.name}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    margin: '0 0 1rem',
                    lineHeight: '1.5'
                  }}>
                    {goal.description}
                  </p>

                  <div style={{
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '0.5rem'
                    }}>
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'var(--color-background-tertiary)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${goal.progress}%`,
                        background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)'
                  }}>
                    <span>Status: {goal.status}</span>
                    <span>Difficulty: {goal.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate('/create-goal')}
            style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
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
            ➕ New Goal
          </button>

          <button
            onClick={() => navigate('/tasks')}
            style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
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
            ✅ View Tasks
          </button>

          <button
            onClick={() => navigate('/log-study-session')}
            style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            📚 Log Study
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;