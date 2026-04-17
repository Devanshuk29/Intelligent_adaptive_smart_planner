import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ConfidenceSelectorPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(null);

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

  const handleViewConfidence = () => {
    if (selectedGoalId) {
      navigate(`/confidence/${selectedGoalId}`);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading goals...</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
        <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
            💪 Confidence Tracking
          </h1>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
              No goals yet
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
              Create a goal first to track confidence
            </p>
            <button
              onClick={() => navigate('/create-goal')}
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
              }}
            >
              🎯 Create Goal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
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
          ← Back to Dashboard
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
          💪 Confidence Tracking
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
          Select a goal to track your topic confidence
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {error && (
          <div style={{
            backgroundColor: 'var(--color-background-danger)',
            border: '0.5px solid var(--color-border-danger)',
            color: 'var(--color-text-danger)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        <div style={{
          backgroundColor: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1.5rem', color: 'var(--color-text-primary)' }}>
            Select a Goal
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                style={{
                  padding: '1.5rem',
                  backgroundColor: selectedGoalId === goal.id 
                    ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                    : 'var(--color-background-secondary)',
                  border: selectedGoalId === goal.id 
                    ? '2px solid #6D28D9'
                    : '1px solid var(--color-border-tertiary)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedGoalId === goal.id ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: selectedGoalId === goal.id ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (selectedGoalId !== goal.id) {
                    e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                    e.currentTarget.style.backgroundColor = 'var(--color-background-tertiary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedGoalId !== goal.id) {
                    e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
                    e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: selectedGoalId === goal.id ? '#1F2937' : 'var(--color-text-primary)',
                  marginBottom: '0.75rem',
                  textShadow: selectedGoalId === goal.id ? '0 1px 2px  rgba(0, 0, 0, 0.1)' : 'none'
                }}>
                  {goal.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: selectedGoalId === goal.id ? '#374151' : 'var(--color-text-secondary)',
                  marginBottom: '1rem',
                  lineHeight: '1.5'
                }}>
                  {goal.description}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: selectedGoalId === goal.id ? '#374151' : 'var(--color-text-secondary)',
                }}>
                  <span>Progress: {goal.progress}%</span>
                  <span>Status: {goal.status}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleViewConfidence}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
          >
            📊 Track Confidence
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceSelectorPage;