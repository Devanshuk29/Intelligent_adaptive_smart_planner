import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
 
const ProgressCheckPage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
 
  const [goal, setGoal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
 
  useEffect(() => {
    fetchProgressData();
  }, [goalId]);
 
  const fetchProgressData = async () => {
    setLoading(true);
    setError('');
 
    try {
      const goalRes = await axios.get(
        `${API_URL}/goals/${goalId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const goalData = goalRes.data.goal || goalRes.data;
      setGoal(goalData);
 
      try {
        const milestonesRes = await axios.get(
          `${API_URL}/milestones/goal/${goalId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const milestonesData = Array.isArray(milestonesRes.data) ? milestonesRes.data : milestonesRes.data.milestones || [];
        setMilestones(milestonesData);
      } catch (err) {
        console.error('Milestones fetch error:', err);
      }
 
      try {
        const tasksRes = await axios.get(
          `${API_URL}/tasks/goal/${goalId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.tasks || [];
        setTasks(tasksData);
      } catch (err) {
        console.error('Tasks fetch error:', err);
      }
 
      try {
        const sessionsRes = await axios.get(
          `${API_URL}/study-sessions/goal/${goalId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sessionsData = Array.isArray(sessionsRes.data.sessions) ? sessionsRes.data.sessions : [];
        setStudySessions(sessionsData);
      } catch (err) {
        console.error('Study sessions fetch error:', err);
      }
 
    } catch (err) {
      console.error('Fetch progress error:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };
 
  // Calculate progress vs planned
  const getProgressAnalysis = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
 
    const completedMilestones = milestones.filter(m => m.completed).length;
    const milestoneProgress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
 
    const totalStudyHours = (studySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60).toFixed(1);
    const targetHoursPerWeek = goal?.time_per_week || 10;
    const weeksElapsed = goal?.deadline ? Math.ceil((new Date(goal.deadline) - new Date(goal.created_at)) / (7 * 24 * 60 * 60 * 1000)) : 1;
    const targetTotalHours = targetHoursPerWeek * weeksElapsed;
    const studyProgress = targetTotalHours > 0 ? Math.round((totalStudyHours / targetTotalHours) * 100) : 0;
 
    return {
      taskProgress,
      milestoneProgress,
      studyProgress,
      totalStudyHours,
      targetTotalHours,
      completedTasks,
      totalTasks,
      completedMilestones,
      totalMilestones: milestones.length
    };
  };
 
  const getMilestoneTimeline = () => {
    return milestones.map(m => ({
      name: m.name,
      planned: new Date(m.end_date).getTime(),
      completed: m.completed ? 1 : 0,
      status: m.completed ? 'Completed' : 'In Progress'
    })).sort((a, b) => a.planned - b.planned);
  };
 
  const getStatusColor = (actual, target) => {
    if (actual >= target) return '#10B981'; 
    if (actual >= target * 0.8) return '#F59E0B'; 
    return '#EF4444'; 
  };
 
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading progress data...</p>
      </div>
    );
  }
 
  const analysis = getProgressAnalysis();
  const milestoneTimeline = getMilestoneTimeline();
 
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
 
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
          📊 Progress Check
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
          {goal?.name} - Compare actual vs planned progress
        </p>
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
 
        {/* Progress Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* Task Progress */}
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Task Progress
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: getStatusColor(analysis.taskProgress, 100), margin: 0, marginBottom: '0.5rem' }}>
              {analysis.taskProgress}%
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
              {analysis.completedTasks} of {analysis.totalTasks} tasks
            </p>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: '3px',
              marginTop: '0.75rem',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${analysis.taskProgress}%`,
                backgroundColor: getStatusColor(analysis.taskProgress, 100),
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
 
          {/* Milestone Progress */}
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Milestone Progress
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: getStatusColor(analysis.milestoneProgress, 100), margin: 0, marginBottom: '0.5rem' }}>
              {analysis.milestoneProgress}%
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
              {analysis.completedMilestones} of {analysis.totalMilestones} milestones
            </p>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: '3px',
              marginTop: '0.75rem',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${analysis.milestoneProgress}%`,
                backgroundColor: getStatusColor(analysis.milestoneProgress, 100),
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
 
          {/* Study Progress */}
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Study Hours Progress
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: getStatusColor(analysis.studyProgress, 100), margin: 0, marginBottom: '0.5rem' }}>
              {analysis.studyProgress}%
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
              {analysis.totalStudyHours} of {analysis.targetTotalHours} hours
            </p>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: '3px',
              marginTop: '0.75rem',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${analysis.studyProgress}%`,
                backgroundColor: getStatusColor(analysis.studyProgress, 100),
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
        </div>
 
        {/* Overall Status */}
        <div style={{
          backgroundColor: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
            📈 Overall Status
          </h3>
          
          {analysis.taskProgress >= 80 && analysis.milestoneProgress >= 80 && analysis.studyProgress >= 80 ? (
            <div style={{
              backgroundColor: 'var(--color-background-success)',
              border: '0.5px solid var(--color-border-success)',
              color: 'var(--color-text-success)',
              padding: '1rem',
              borderRadius: 'var(--border-radius-md)',
              marginBottom: '1rem'
            }}>
              ✅ You're on track! All metrics are at or above 80%. Keep up the momentum!
            </div>
          ) : analysis.taskProgress < 60 || analysis.milestoneProgress < 60 || analysis.studyProgress < 60 ? (
            <div style={{
              backgroundColor: 'var(--color-background-danger)',
              border: '0.5px solid var(--color-border-danger)',
              color: 'var(--color-text-danger)',
              padding: '1rem',
              borderRadius: 'var(--border-radius-md)',
              marginBottom: '1rem'
            }}>
              ⚠️ You're falling behind! Consider visiting the Suggestions page for a replanning strategy.
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--color-background-warning)',
              border: '0.5px solid var(--color-border-warning)',
              color: 'var(--color-text-warning)',
              padding: '1rem',
              borderRadius: 'var(--border-radius-md)',
              marginBottom: '1rem'
            }}>
              ⏳ You're slightly behind pace. Check the Suggestions page for optimization tips.
            </div>
          )}
 
          <button
            onClick={() => navigate(`/suggestions/${goalId}`)}
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
            💡 Get Replanning Suggestions →
          </button>
        </div>
 
        {/* Milestone Timeline */}
        {milestones.length > 0 && (
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
              🎯 Milestone Timeline
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                color: 'var(--color-text-primary)'
              }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Milestone</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Deadline</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((milestone, idx) => (
                    <tr key={idx} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                      <td style={{ padding: '0.75rem' }}>{milestone.name}</td>
                      <td style={{ padding: '0.75rem' }}>{new Date(milestone.end_date).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--border-radius-md)',
                          backgroundColor: milestone.completed ? 'var(--color-background-success)' : 'var(--color-background-warning)',
                          color: milestone.completed ? 'var(--color-text-success)' : 'var(--color-text-warning)',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {milestone.completed ? '✓ Completed' : '⏳ In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default ProgressCheckPage;