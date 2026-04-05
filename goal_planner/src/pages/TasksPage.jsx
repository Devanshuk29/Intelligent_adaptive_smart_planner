import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TasksPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [todaysTasks, setTodaysTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('today'); // today, all, incomplete, completed
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch all tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');

    try {
      // Get all goals first
      const goalsRes = await axios.get(
        `${API_URL}/goals`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const goals = Array.isArray(goalsRes.data) ? goalsRes.data : goalsRes.data.goals || [];
      let allTasksData = [];

      // Get tasks for each goal
      for (const goal of goals) {
        try {
          const tasksRes = await axios.get(
            `${API_URL}/tasks/goal/${goal.id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.tasks || [];
          allTasksData = [...allTasksData, ...tasks.map(t => ({ ...t, goal_name: goal.name, goal_id: goal.id }))];
        } catch (err) {
          console.error(`Failed to get tasks for goal ${goal.id}:`, err);
        }
      }

      console.log('All tasks loaded:', allTasksData);
      setAllTasks(allTasksData);

      // Filter today's tasks (due today or overdue)
      const today = new Date().toISOString().split('T')[0];
      const todaysTasksList = allTasksData.filter(task => {
        const dueDate = task.due_date ? task.due_date.split('T')[0] : null;
        return dueDate && dueDate <= today && !task.completed;
      });

      setTodaysTasks(todaysTasksList);

    } catch (err) {
      console.error('Fetch tasks error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load tasks. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    setUpdatingTaskId(taskId);

    try {
      await axios.patch(
        `${API_URL}/tasks/${taskId}`,
        { completed: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setTodaysTasks(todaysTasks.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
      setAllTasks(allTasks.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));

    } catch (err) {
      console.error('Toggle task error:', err);
      setError('Failed to update task. Try again.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Get filtered tasks
  const getFilteredTasks = () => {
    if (filter === 'today') return todaysTasks;
    if (filter === 'incomplete') return allTasks.filter(t => !t.completed);
    if (filter === 'completed') return allTasks.filter(t => t.completed);
    return allTasks;
  };

  // Calculate progress
  const calculateProgress = (taskList) => {
    if (taskList.length === 0) return 0;
    const completed = taskList.filter(t => t.completed).length;
    return Math.round((completed / taskList.length) * 100);
  };

  const filteredTasks = getFilteredTasks();
  const progress = calculateProgress(filteredTasks);
  const completedCount = filteredTasks.filter(t => t.completed).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
          Tasks
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>
          Manage and track your daily tasks
        </p>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { value: 'today', label: "Today's Tasks" },
            { value: 'incomplete', label: 'Incomplete' },
            { value: 'completed', label: 'Completed' },
            { value: 'all', label: 'All Tasks' }
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
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Progress Section */}
        {filteredTasks.length > 0 && (
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                Progress: {completedCount}/{filteredTasks.length} tasks
              </span>
              <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                {progress}%
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
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#3B82F6',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}

        {/* Log Study Session Button */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/log-study-session')}
            style={{
              padding: '1rem 2rem',
              backgroundColor: 'var(--color-background-info)',
              color: 'var(--color-text-info)',
              border: '0.5px solid var(--color-border-info)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            📊 Log Study Session (Pomodoro Timer)
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty State */
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            borderRadius: 'var(--border-radius-lg)',
            border: '0.5px solid var(--color-border-tertiary)',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>
              No {filter === 'today' ? "today's" : filter === 'incomplete' ? 'incomplete' : filter === 'completed' ? 'completed' : ''} tasks
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
              {filter === 'today' ? 'Great! No tasks due today.' : 'All caught up!'}
            </p>
          </div>
        ) : (
          /* Tasks List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTasks.map(task => (
              <div
                key={task.id}
                style={{
                  backgroundColor: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: updatingTaskId === task.id ? 0.7 : 1,
                  borderLeft: `4px solid ${task.completed ? '#10B981' : '#3B82F6'}`
                }}
                onClick={() => toggleTaskCompletion(task.id, task.completed)}
              >
                {/* Checkbox */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid var(--color-border-secondary)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: task.completed ? '#10B981' : 'transparent',
                  borderColor: task.completed ? '#10B981' : 'var(--color-border-secondary)',
                  flexShrink: 0
                }}>
                  {task.completed && <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold' }}>✓</span>}
                </div>

                {/* Task Info */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: task.completed ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    margin: 0
                  }}>
                    {task.name}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {task.goal_name && <span>📌 {task.goal_name}</span>}
                    {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                    {task.estimated_time && <span>⏱️ {task.estimated_time}h</span>}
                  </div>
                </div>

                {/* Status */}
                {task.completed && (
                  <span style={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Done
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {allTasks.length > 0 && (
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
                {allTasks.length}
              </p>
            </div>
            <div style={{
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Incomplete</p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: 'var(--color-text-warning)', margin: '0.5rem 0 0' }}>
                {allTasks.filter(t => !t.completed).length}
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
                {allTasks.filter(t => t.completed).length}
              </p>
            </div>
            <div style={{
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Overall Progress</p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: 'var(--color-text-info)', margin: '0.5rem 0 0' }}>
                {calculateProgress(allTasks)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;