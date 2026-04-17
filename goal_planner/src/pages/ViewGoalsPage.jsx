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
  const [deleteConfirmGoalId, setDeleteConfirmGoalId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `${API_URL}/goals`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const goalsData = Array.isArray(res.data) ? res.data : res.data.goals || [];
      setGoals(goalsData);
    } catch (err) {
      console.error('Fetch goals error:', err);
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    setDeleting(true);
    try {
      await axios.delete(
        `${API_URL}/goals/${goalId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGoals(goals.filter(g => g.id !== goalId));
      setDeleteConfirmGoalId(null);
      alert('✓ Goal deleted successfully');
    } catch (err) {
      console.error('Delete goal error:', err);
      setError('Failed to delete goal. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading goals...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
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
          ← Back to Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
              🎯 My Goals
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
              View and manage all your learning goals
            </p>
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
            + Create Goal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
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

        {goals.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
              No goals yet
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
              Create your first goal to get started
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
              🎯 Create Goal
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {goals.map((goal) => (
              <div
                key={goal.id}
                style={{
                  backgroundColor: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Goal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3
                      onClick={() => navigate(`/goal/${goal.id}`)}
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: 0,
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = 'var(--color-text-info)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'var(--color-text-primary)';
                      }}
                    >
                      {goal.name}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      margin: '0.5rem 0 0',
                      lineHeight: '1.4'
                    }}>
                      {goal.description || 'No description'}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmGoalId(goal.id);
                    }}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-danger)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      marginLeft: '0.5rem'
                    }}
                    title="Delete goal"
                  >
                    🗑️
                  </button>
                </div>

                {/* Goal Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>Difficulty</p>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: {
                        easy: '#10B981',
                        medium: '#F59E0B',
                        hard: '#EF4444'
                      }[goal.difficulty] || '#6B7280',
                      margin: '0.25rem 0 0',
                      textTransform: 'capitalize'
                    }}>
                      {goal.difficulty}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>Hours/Week</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', margin: '0.25rem 0 0' }}>
                      {goal.time_per_week}h
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Progress</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      {goal.progress}%
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
                      height: '100%',
                      width: `${goal.progress}%`,
                      backgroundColor: goal.progress >= 80 ? '#10B981' : goal.progress >= 50 ? '#F59E0B' : '#EF4444',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>

                {/* Deadline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => navigate(`/goal/${goal.id}`)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'transparent',
                      border: '0.5px solid var(--color-border-secondary)',
                      borderRadius: 'var(--border-radius-md)',
                      fontSize: '12px',
                      color: 'var(--color-text-info)',
                      cursor: 'pointer'
                    }}
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmGoalId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
              Delete Goal?
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 2rem' }}>
              Are you sure you want to delete this goal? This action cannot be undone. All milestones and tasks will be deleted.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setDeleteConfirmGoalId(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'transparent',
                  border: '0.5px solid var(--color-border-secondary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer'
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGoal(deleteConfirmGoalId)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-background-danger)',
                  border: '0.5px solid var(--color-border-danger)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--color-text-danger)',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1
                }}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewGoalsPage;