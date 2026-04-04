import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const CreateGoalPage = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    difficulty: 'medium',
    time_per_week: 10
  });

  const [roadmapPreview, setRoadmapPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) {
      setError('Goal name must be at least 3 characters');
      return false;
    }
    if (!formData.deadline) {
      setError('Deadline is required');
      return false;
    }
    const selectedDate = new Date(formData.deadline);
    if (selectedDate <= new Date()) {
      setError('Deadline must be in the future');
      return false;
    }
    if (!formData.difficulty) {
      setError('Difficulty is required');
      return false;
    }
    if (formData.time_per_week < 1 || formData.time_per_week > 168) {
      setError('Time per week must be between 1 and 168 hours');
      return false;
    }
    return true;
  };

  const generateRoadmapPreview = () => {
    if (!validateForm()) return;

    const deadline = new Date(formData.deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    const weeksUntilDeadline = Math.ceil(daysUntilDeadline / 7);

    const difficultyWeeks = {
      easy: 2,
      medium: 3,
      hard: 4
    };

    const weeksPerMilestone = difficultyWeeks[formData.difficulty];
    const numMilestones = Math.ceil(weeksUntilDeadline / weeksPerMilestone);

    const milestones = [];
    let currentDate = new Date(today);

    for (let i = 0; i < numMilestones; i++) {
      const milestoneEnd = new Date(currentDate);
      milestoneEnd.setDate(milestoneEnd.getDate() + weeksPerMilestone * 7);

      const tasksPerMilestone = formData.difficulty === 'easy' ? 2 : formData.difficulty === 'medium' ? 3 : 4;

      milestones.push({
        id: i + 1,
        name: `Milestone ${i + 1}`,
        startDate: currentDate.toLocaleDateString(),
        endDate: milestoneEnd > deadline ? deadline.toLocaleDateString() : milestoneEnd.toLocaleDateString(),
        tasks: Array.from({ length: tasksPerMilestone }, (_, idx) => ({
          id: idx + 1,
          name: `Task ${idx + 1}`,
          completed: false
        }))
      });

      currentDate = new Date(milestoneEnd);
      if (currentDate >= deadline) break;
    }

    setRoadmapPreview({
      goalName: formData.name,
      totalWeeks: weeksUntilDeadline,
      milestones: milestones,
      totalTasks: milestones.reduce((sum, m) => sum + m.tasks.length, 0)
    });

    setShowPreview(true);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'time_per_week' ? parseInt(value) : value
    }));
    setShowPreview(false);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/goals`,
        {
          name: formData.name,
          description: formData.description || null,
          deadline: new Date(formData.deadline).toISOString(),
          difficulty: formData.difficulty,
          time_per_week: formData.time_per_week
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Goal created:', response.data);

      alert(`✓ Goal "${formData.name}" created successfully with smart roadmap!`);
      navigate(`/goal/${response.data.id || response.data.goal.id}`);

    } catch (err) {
      console.error('Create goal error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to create goal. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>Create New Goal</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>Set up your learning goal with AI-powered roadmap</p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Form Section */}
          <div style={{ backgroundColor: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-tertiary)', padding: '2rem' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 1.5rem', color: 'var(--color-text-primary)' }}>Goal Details</h2>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Goal Name */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                  Goal Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Master Data Structures"
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
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What do you want to achieve with this goal?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '14px',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-background-secondary)',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Deadline */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                  Deadline *
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
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
                {formData.deadline && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
                    Days remaining: {Math.ceil((new Date(formData.deadline) - new Date()) / (1000 * 60 * 60 * 24))}
                  </p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                  Difficulty *
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['easy', 'medium', 'hard'].map(level => (
                    <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={formData.difficulty === level}
                        onChange={handleInputChange}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Per Week */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                  Study Hours Per Week *
                </label>
                <input
                  type="number"
                  name="time_per_week"
                  value={formData.time_per_week}
                  onChange={handleInputChange}
                  min="1"
                  max="168"
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
                  {formData.time_per_week} hours/week = {(formData.time_per_week * 52 / (formData.deadline ? Math.ceil((new Date(formData.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 7)) : 1)).toFixed(1)} hours/week until deadline
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: 'var(--color-background-danger)',
                  border: '0.5px solid var(--color-border-danger)',
                  color: 'var(--color-text-danger)',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/goals')}
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
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={generateRoadmapPreview}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-background-warning)',
                    border: '0.5px solid var(--color-border-warning)',
                    color: 'var(--color-text-warning)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Preview Roadmap
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: loading ? 'var(--color-background-secondary)' : 'var(--color-background-info)',
                    border: `0.5px solid ${loading ? 'var(--color-border-secondary)' : 'var(--color-border-info)'}`,
                    color: loading ? 'var(--color-text-secondary)' : 'var(--color-text-info)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Goal with Roadmap'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div>
            {showPreview && roadmapPreview ? (
              <div style={{ backgroundColor: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-tertiary)', padding: '2rem' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 1.5rem', color: 'var(--color-text-primary)' }}>
                  🎯 Roadmap Preview
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--color-background-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Goal</p>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', margin: '0.25rem 0 0' }}>
                      {roadmapPreview.goalName}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'var(--color-background-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Duration</p>
                      <p style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text-info)', margin: '0.25rem 0 0' }}>
                        {roadmapPreview.totalWeeks} weeks
                      </p>
                    </div>
                    <div style={{ backgroundColor: 'var(--color-background-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Total Tasks</p>
                      <p style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text-success)', margin: '0.25rem 0 0' }}>
                        {roadmapPreview.totalTasks} tasks
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', margin: '1rem 0 0.75rem', color: 'var(--color-text-primary)' }}>
                      Milestones ({roadmapPreview.milestones.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {roadmapPreview.milestones.map((milestone, idx) => (
                        <div key={milestone.id} style={{ backgroundColor: 'var(--color-background-secondary)', padding: '0.75rem', borderRadius: 'var(--border-radius-md)', borderLeft: `3px solid var(--color-background-info)` }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>
                            {milestone.name}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>
                            {milestone.startDate} → {milestone.endDate}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>
                            {milestone.tasks.length} tasks
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--color-background-success)', color: 'var(--color-text-success)', padding: '1rem', borderRadius: 'var(--border-radius-md)', fontSize: '13px' }}>
                    ✓ Roadmap generated! Click "Create Goal" to save.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-tertiary)', padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Fill in the details and click "Preview Roadmap" to see your AI-generated learning roadmap
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGoalPage;