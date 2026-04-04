import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const GoalRoadmapPage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch goal details, milestones, and tasks
  useEffect(() => {
    fetchGoalData();
  }, [goalId]);

  const fetchGoalData = async () => {
    setLoading(true);
    setError('');

    try {
      // Get goal details
      const goalRes = await axios.get(
        `${API_URL}/goals/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const goalData = goalRes.data.goal || goalRes.data;
      console.log('Goal data received:', goalData);
      console.log('Milestones from goal:', goalData.milestones);

      setGoal(goalData);

      // Make sure milestones is an array
      const milestonesArray = Array.isArray(goalData.milestones) 
        ? goalData.milestones 
        : goalData.milestones && typeof goalData.milestones === 'object' 
          ? Object.values(goalData.milestones)
          : [];

      console.log('Milestones array set to:', milestonesArray);
      setMilestones(milestonesArray);

      // Get all tasks for this goal
      const tasksRes = await axios.get(
        `${API_URL}/tasks/goal/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.tasks || [];
      console.log('All tasks received:', tasksData);
      setTasks(tasksData);

    } catch (err) {
      console.error('Fetch goal data error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load goal. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    setUpdatingTaskId(taskId);

    try {
      const response = await axios.patch(
        `${API_URL}/tasks/${taskId}`,
        { completed: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Task updated:', response.data);

      // Update local state
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));

      // Recalculate goal progress
      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t);
      const completedTasks = updatedTasks.filter(t => t.completed).length;
      const totalTasks = updatedTasks.length;
      const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setGoal(prev => ({ ...prev, progress: newProgress }));

    } catch (err) {
      console.error('Toggle task error:', err);
      setError('Failed to update task. Try again.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Get tasks for a specific milestone
  const getTasksForMilestone = (milestoneId) => {
    const filtered = tasks.filter(t => t.milestone_id === milestoneId);
    console.log(`Tasks for milestone ${milestoneId}:`, filtered);
    return filtered;
  };

  // Calculate milestone progress
  const getMilestoneProgress = (milestoneId) => {
    const milestoneTasks = getTasksForMilestone(milestoneId);
    if (milestoneTasks.length === 0) return 0;
    const completed = milestoneTasks.filter(t => t.completed).length;
    return Math.round((completed / milestoneTasks.length) * 100);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading roadmap...</p>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: 'var(--color-text-danger)', margin: '0 0 1rem' }}>{error || 'Goal not found'}</p>
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

  const statusColor = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444'
  }[goal.difficulty] || '#6B7280';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate('/goals')}
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
          ← Back to Goals
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
              {goal.name}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
              {goal.description || 'No description'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: statusColor,
              color: '#FFFFFF',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--border-radius-md)',
              fontWeight: '500',
              marginBottom: '0.5rem',
              textTransform: 'capitalize'
            }}>
              {goal.difficulty}
            </div>
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Overall Progress</span>
            <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
              {goal.progress || 0}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${goal.progress || 0}%`,
              height: '100%',
              backgroundColor: statusColor,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
            Roadmap ({milestones.length} milestones)
          </h2>

          {milestones && milestones.length > 0 ? (
            milestones.map((milestone, idx) => {
              const milestoneTasks = getTasksForMilestone(milestone.id);
              const milestoneProgress = getMilestoneProgress(milestone.id);

              return (
                <div
                  key={milestone.id}
                  style={{
                    backgroundColor: 'var(--color-background-primary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '1.5rem',
                    borderLeft: `4px solid ${milestoneProgress === 100 ? '#10B981' : '#3B82F6'}`
                  }}
                >
                  {/* Milestone Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
                        {milestone.name}
                        {milestoneProgress === 100 && <span style={{ marginLeft: '0.5rem' }}>✓</span>}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>
                         {new Date(milestone.start_date).toLocaleDateString()} → {new Date(milestone.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                        {milestoneProgress}%
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {milestoneTasks.filter(t => t.completed).length}/{milestoneTasks.length} tasks
                      </div>
                    </div>
                  </div>

                  {/* Milestone Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--color-background-secondary)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      width: `${milestoneProgress}%`,
                      height: '100%',
                      backgroundColor: milestoneProgress === 100 ? '#10B981' : '#3B82F6',
                      transition: 'width 0.3s'
                    }} />
                  </div>

                  {/* Tasks */}
                  {milestoneTasks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {milestoneTasks.map(task => (
                        <div
                          key={task.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem',
                            backgroundColor: 'var(--color-background-secondary)',
                            borderRadius: 'var(--border-radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: updatingTaskId === task.id ? 0.7 : 1
                          }}
                          onClick={() => toggleTaskCompletion(task.id, task.completed)}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid var(--color-border-secondary)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: task.completed ? '#10B981' : 'transparent',
                            borderColor: task.completed ? '#10B981' : 'var(--color-border-secondary)',
                            flexShrink: 0
                          }}>
                            {task.completed && <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                          </div>
                          <span style={{
                            flex: 1,
                            fontSize: '14px',
                            color: task.completed ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}>
                            {task.name}
                          </span>
                          {task.hours && (
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                              {task.hours}h
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                      No tasks in this milestone
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No milestones found</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {milestones.length > 0 && (
          <div style={{
            marginTop: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Total Tasks</p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: 'var(--color-text-primary)', margin: '0.5rem 0 0' }}>
                {tasks.length}
              </p>
            </div>
            <div style={{
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Completed</p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: 'var(--color-text-success)', margin: '0.5rem 0 0' }}>
                {tasks.filter(t => t.completed).length}
              </p>
            </div>
            <div style={{
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Remaining</p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: 'var(--color-text-warning)', margin: '0.5rem 0 0' }}>
                {tasks.filter(t => !t.completed).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalRoadmapPage;