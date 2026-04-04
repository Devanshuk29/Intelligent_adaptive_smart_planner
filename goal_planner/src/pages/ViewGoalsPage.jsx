import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ViewGoalsPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); d

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(
        `${API_URL}/goals`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Goals response:', response.data);

      const goalsData = Array.isArray(response.data) ? response.data : response.data.goals || [];
      setGoals(goalsData);

    } catch (err) {
      console.error('Fetch goals error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load goals. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredGoals = () => {
    if (filter === 'all') return goals;
    if (filter === 'inProgress') return goals.filter(g => g.progress > 0 && g.progress < 100);
    if (filter === 'notStarted') return goals.filter(g => g.progress === 0);
    if (filter === 'completed') return goals.filter(g => g.progress === 100);
    return goals;
  };

  const getStatusInfo = (progress) => {
    if (progress === 0) return { label: 'Not Started', color: '#FCD34D', textColor: '#78350F' };
    if (progress < 50) return { label: 'In Progress', color: '#BFDBFE', textColor: '#1E40AF' };
    if (progress < 100) return { label: 'Almost Done', color: '#86EFAC', textColor: '#166534' };
    return { label: 'Completed', color: '#10B981', textColor: '#FFFFFF' };
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const filteredGoals = getFilteredGoals();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>Your Goals</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>Track and manage your learning goals</p>
        </div>
        <button
          onClick={() => navigate('/create-goal')}
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
          + New Goal
        </button>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { value: 'all', label: 'All Goals' },
            { value: 'notStarted', label: 'Not Started' },
            { value: 'inProgress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: filter === option.value ? 'var(--color-background-info)' : 'transparent',
                color: filter === option.value ? 'var(--color-text-info)' : 'var(--color-text-secondary)',
                border: filter === option.value ? '0.5px solid var(--color-border-info)' : '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'var(--color-background-danger)',
            border: '0.5px solid var(--color-border-danger)',
            color: 'var(--color-text-danger)',
            padding: '1rem',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{error}</span>
            <button
              onClick={fetchGoals}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-background-danger)',
                color: 'var(--color-text-danger)',
                border: '0.5px solid var(--color-border-danger)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading your goals...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          /* Empty State */
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            borderRadius: 'var(--border-radius-lg)',
            border: '0.5px solid var(--color-border-tertiary)',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>
              No goals yet
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 1.5rem' }}>
              {filter === 'all' 
                ? 'Create your first goal to get started!' 
                : `No ${filter === 'notStarted' ? 'goals not started' : filter === 'inProgress' ? 'goals in progress' : 'completed goals'}`}
            </p>
            <button
              onClick={() => navigate('/create-goal')}
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
              + Create Goal
            </button>
          </div>
        ) : (
          /* Goals Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {filteredGoals.map(goal => {
              const statusInfo = getStatusInfo(goal.progress || 0);
              const daysLeft = getDaysRemaining(goal.deadline);
              const difficultyColor = {
                easy: '#10B981',
                medium: '#F59E0B',
                hard: '#EF4444'
              }[goal.difficulty] || '#6B7280';

              return (
                <div
                  key={goal.id}
                  onClick={() => navigate(`/goal/${goal.id}`)}
                  style={{
                    backgroundColor: 'var(--color-background-primary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 0 transparent';
                  }}
                >
                  {/* Goal Header */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0, flex: 1 }}>
                        {goal.name}
                      </h3>
                      <div style={{
                        backgroundColor: statusInfo.color,
                        color: statusInfo.textColor,
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--border-radius-md)',
                        fontSize: '12px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        marginLeft: '0.5rem'
                      }}>
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* Difficulty & Days */}
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '12px' }}>
                      <span style={{
                        backgroundColor: difficultyColor,
                        color: '#FFFFFF',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {goal.difficulty}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Progress</span>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                        {goal.progress || 0}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'var(--color-background-secondary)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${goal.progress || 0}%`,
                        height: '100%',
                        backgroundColor: statusInfo.color,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>

                  {/* Stats */}
                  {goal.description && (
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      margin: '1rem 0 0',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {goal.description}
                    </p>
                  )}

                  {/* Click to view */}
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-info)', fontWeight: '500' }}>
                      Click to view roadmap →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {goals.length > 0 && (
          <div style={{
            marginTop: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            backgroundColor: 'var(--color-background-primary)',
            borderRadius: 'var(--border-radius-lg)',
            border: '0.5px solid var(--color-border-tertiary)',
            padding: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Total Goals</p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: 'var(--color-text-primary)', margin: '0.5rem 0 0' }}>
                {goals.length}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>In Progress</p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: 'var(--color-text-info)', margin: '0.5rem 0 0' }}>
                {goals.filter(g => g.progress > 0 && g.progress < 100).length}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Completed</p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: 'var(--color-text-success)', margin: '0.5rem 0 0' }}>
                {goals.filter(g => g.progress === 100).length}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Average Progress</p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: 'var(--color-text-warning)', margin: '0.5rem 0 0' }}>
                {goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) : 0}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewGoalsPage;