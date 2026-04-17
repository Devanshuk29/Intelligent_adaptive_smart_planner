import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
 
const SuggestionsPage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
 
  const [goal, setGoal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [confidenceData, setConfidenceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState(null);
 
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
 
      try {
        const confRes = await axios.get(
          `${API_URL}/analytics/confidence/${goalId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const confData = confRes.data.chartData || confRes.data.data || [];
        setConfidenceData(Array.isArray(confData) ? confData : []);
      } catch (err) {
        console.error('Confidence fetch error:', err);
      }
 
    } catch (err) {
      console.error('Fetch data error:', err);
      setError('Failed to load data for suggestions');
    } finally {
      setLoading(false);
    }
  };
 
  const generateSuggestions = () => {
    const suggestions = {
      taskOptimization: [],
      studyOptimization: [],
      confidenceBoost: [],
      milestoneAdjustment: []
    };
 
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
 
    if (taskProgress < 50) {
      suggestions.taskOptimization.push({
        icon: '⚡',
        title: 'Increase Task Completion Rate',
        description: `You've completed ${completedTasks}/${totalTasks} tasks (${Math.round(taskProgress)}%). Try completing 2-3 tasks daily to catch up.`,
        action: 'Focus on smaller tasks first to build momentum'
      });
    }
 
    const incompleteTasks = tasks.filter(t => !t.completed);
    if (incompleteTasks.length > 10) {
      suggestions.taskOptimization.push({
        icon: '📋',
        title: 'Break Down Large Task List',
        description: `You have ${incompleteTasks.length} incomplete tasks. Consider grouping related tasks into milestones.`,
        action: 'Create a priority ranking for tasks'
      });
    }
 
    // Study optimization
    const totalStudyHours = (studySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60).toFixed(1);
    const targetHoursPerWeek = goal?.time_per_week || 10;
    const weeksElapsed = goal?.deadline ? Math.max(1, Math.ceil((new Date(goal.deadline) - new Date(goal.created_at)) / (7 * 24 * 60 * 60 * 1000))) : 1;
    const targetTotalHours = targetHoursPerWeek * weeksElapsed;
    const studyProgress = (totalStudyHours / targetTotalHours) * 100;
 
    if (studyProgress < 70) {
      const hoursNeeded = (targetTotalHours - totalStudyHours).toFixed(1);
      suggestions.studyOptimization.push({
        icon: '📚',
        title: 'Increase Study Time',
        description: `You need ${hoursNeeded} more hours to meet your target. You've logged ${totalStudyHours}/${targetTotalHours} hours.`,
        action: `Aim for ${Math.ceil(hoursNeeded / Math.max(1, weeksElapsed - 1))} hours per week going forward`
      });
    }
 
    const avgPomodoros = studySessions.length > 0 
      ? (studySessions.reduce((sum, s) => sum + (s.pomodoros_completed || 0), 0) / studySessions.length).toFixed(1)
      : 0;
 
    if (avgPomodoros > 0 && avgPomodoros < 2) {
      suggestions.studyOptimization.push({
        icon: '⏱️',
        title: 'Extend Study Sessions',
        description: `Your average session is ${avgPomodoros} pomodoros. Longer sessions (4+ pomodoros) improve learning retention.`,
        action: 'Aim for 100-minute (4 pomodoro) study sessions'
      });
    }
 
    // Confidence boost
    const weakTopics = confidenceData.filter(t => t.confidence < 60);
    const strongTopics = confidenceData.filter(t => t.confidence >= 80);
 
    if (weakTopics.length > 0) {
      suggestions.confidenceBoost.push({
        icon: '💪',
        title: `Focus on Weak Topics`,
        description: `Topics below 60% confidence: ${weakTopics.map(t => t.name).join(', ')}`,
        action: 'Allocate 30% of study time to weak topics'
      });
    }
 
    if (strongTopics.length > 0) {
      suggestions.confidenceBoost.push({
        icon: '🎯',
        title: 'Maintain Expert Topics',
        description: `Great! You're expert (80%+) in: ${strongTopics.map(t => t.name).join(', ')}`,
        action: 'Do quick reviews weekly to maintain mastery'
      });
    }
 
    // Milestone adjustment
    const completedMilestones = milestones.filter(m => m.completed).length;
    const totalMilestones = milestones.length;
 
    if (completedMilestones / totalMilestones < 0.3) {
      suggestions.milestoneAdjustment.push({
        icon: '🔄',
        title: 'Adjust Milestone Deadlines',
        description: `Only ${completedMilestones}/${totalMilestones} milestones are done. Consider extending timelines.`,
        action: 'Push back remaining milestone deadlines by 1-2 weeks'
      });
    }
 
    if (totalMilestones === 0) {
      suggestions.milestoneAdjustment.push({
        icon: '🏗️',
        title: 'Create Milestones',
        description: 'Breaking your goal into 3-4 milestones helps track progress better.',
        action: 'Add major checkpoints throughout your goal timeline'
      });
    }
 
    return suggestions;
  };
 
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading suggestions...</p>
      </div>
    );
  }
 
  const allSuggestions = generateSuggestions();
  const hasSuggestions = 
    allSuggestions.taskOptimization.length > 0 ||
    allSuggestions.studyOptimization.length > 0 ||
    allSuggestions.confidenceBoost.length > 0 ||
    allSuggestions.milestoneAdjustment.length > 0;
 
  const SuggestionCard = ({ suggestion }) => (
    <div style={{
      backgroundColor: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '1.5rem',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '24px', flexShrink: 0 }}>{suggestion.icon}</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 0.5rem', color: 'var(--color-text-primary)' }}>
            {suggestion.title}
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 0.75rem' }}>
            {suggestion.description}
          </p>
          <div style={{
            backgroundColor: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            padding: '0.75rem',
            fontSize: '12px',
            color: 'var(--color-text-info)',
            fontWeight: '500'
          }}>
            ✨ {suggestion.action}
          </div>
        </div>
      </div>
    </div>
  );
 
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate(`/progress-check/${goalId}`)}
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
          ← Back to Progress Check
        </button>
 
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
          💡 Smart Suggestions
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
          {goal?.name} - Personalized replanning recommendations
        </p>
      </div>
 
      {/* Main Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        
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
 
        {!hasSuggestions && (
          <div style={{
            backgroundColor: 'var(--color-background-success)',
            border: '0.5px solid var(--color-border-success)',
            color: 'var(--color-text-success)',
            padding: '1.5rem',
            borderRadius: 'var(--border-radius-lg)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>🎉 You're on track!</p>
            <p style={{ fontSize: '13px', margin: '0.5rem 0 0' }}>
              No adjustments needed. Keep up your current pace!
            </p>
          </div>
        )}
 
        {/* Task Optimization */}
        {allSuggestions.taskOptimization.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
              📋 Task Optimization
            </h2>
            {allSuggestions.taskOptimization.map((s, idx) => (
              <SuggestionCard key={idx} suggestion={s} />
            ))}
          </div>
        )}
 
        {/* Study Optimization */}
        {allSuggestions.studyOptimization.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
              📚 Study Optimization
            </h2>
            {allSuggestions.studyOptimization.map((s, idx) => (
              <SuggestionCard key={idx} suggestion={s} />
            ))}
          </div>
        )}
 
        {/* Confidence Boost */}
        {allSuggestions.confidenceBoost.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
              💪 Confidence Boost
            </h2>
            {allSuggestions.confidenceBoost.map((s, idx) => (
              <SuggestionCard key={idx} suggestion={s} />
            ))}
          </div>
        )}
 
        {/* Milestone Adjustment */}
        {allSuggestions.milestoneAdjustment.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
              🔄 Milestone Adjustment
            </h2>
            {allSuggestions.milestoneAdjustment.map((s, idx) => (
              <SuggestionCard key={idx} suggestion={s} />
            ))}
          </div>
        )}
 
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/analytics/${goalId}`)}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-background-primary)',
              color: 'var(--color-text-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📊 View Analytics
          </button>
          <button
            onClick={() => navigate(`/goal/${goalId}`)}
            style={{
              flex: 1,
              minWidth: '150px',
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
            🎯 Go to Goal Details
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default SuggestionsPage;