import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AnalyticsPage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [confidenceData, setConfidenceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAnalytics();
  }, [goalId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch goal
      const goalRes = await axios.get(
        `${API_URL}/goals/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const goalData = goalRes.data.goal || goalRes.data;
      setGoal(goalData);

      // Fetch tasks
      try {
        const tasksRes = await axios.get(
          `${API_URL}/tasks/goal/${goalId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.tasks || [];
        setTasks(tasksData);
      } catch (err) {
        console.error('Tasks fetch error:', err);
      }

      // Fetch study sessions
      try {
        const sessionsRes = await axios.get(
          `${API_URL}/study-sessions/goal/${goalId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const sessionsData = Array.isArray(sessionsRes.data.sessions) 
          ? sessionsRes.data.sessions 
          : [];

        console.log('Study sessions loaded:', sessionsData);
        setStudySessions(sessionsData);
      } catch (err) {
        console.error('Study sessions fetch error:', err);
        setStudySessions([]);
      }

      // Fetch confidence data
      // Fetch confidence data
try {
  const confRes = await axios.get(
    `${API_URL}/analytics/confidence/${goalId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  console.log('Full confidence response:', confRes.data);
  console.log('Chart data:', confRes.data.chartData);

  const confData = confRes.data.chartData || confRes.data.data || [];
  console.log('Processed confidence data:', confData);
  setConfidenceData(Array.isArray(confData) ? confData : []);
} catch (err) {
  console.error('Confidence fetch error:', err);
  setConfidenceData([]);
}

    } catch (err) {
      console.error('Fetch analytics error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load analytics';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate study hours by date
  const getStudyHoursData = () => {
    const hoursMap = {};
    
    if (!Array.isArray(studySessions) || studySessions.length === 0) {
      return [];
    }
    
    studySessions.forEach(session => {
      const date = session.created_at 
        ? new Date(session.created_at).toLocaleDateString() 
        : 'Unknown';
      hoursMap[date] = (hoursMap[date] || 0) + (session.duration_minutes || 0) / 60;
    });
    
    // Sort dates chronologically
    const sortedData = Object.entries(hoursMap)
      .map(([date, hours]) => ({ 
        date, 
        hours: parseFloat(hours.toFixed(2)) 
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return sortedData;
  };

  // Calculate task completion
  const getTaskStats = () => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Calculate total study hours
  const getTotalStudyHours = () => {
    return (studySessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) / 60).toFixed(1);
  };

  // Calculate average pomodoros
  const getAveragePomodoros = () => {
    if (studySessions.length === 0) return 0;
    const total = studySessions.reduce((sum, session) => sum + (session.pomodoros_completed || 0), 0);
    return (total / studySessions.length).toFixed(1);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading analytics...</p>
      </div>
    );
  }

  const studyHoursData = getStudyHoursData();
  const taskStats = getTaskStats();
  const totalHours = getTotalStudyHours();
  const avgPomodoros = getAveragePomodoros();

  const COLORS = ['#3B82F6', '#10B981', '#EAB308', '#EF4444', '#8B5CF6'];

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
          📊 Analytics
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
          {goal?.name} - Your progress and insights
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

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Total Study Hours
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: 'var(--color-text-info)', margin: 0 }}>
              {totalHours}
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Study Sessions
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: 'var(--color-text-warning)', margin: 0 }}>
              {studySessions.length}
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Avg Pomodoros/Session
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: 'var(--color-text-success)', margin: 0 }}>
              {avgPomodoros}
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
              Task Completion
            </p>
            <p style={{ fontSize: '28px', fontWeight: '600', color: 'var(--color-text-info)', margin: 0 }}>
              {taskStats.percentage}%
            </p>
          </div>
        </div>

        {/* Study Hours Chart */}
        {studyHoursData.length > 0 && (
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
              📚 Study Hours Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studyHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
                <YAxis stroke="var(--color-text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)' }} />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Confidence Chart */}
        {/* Confidence Chart */}
{confidenceData.length > 0 && (
  <div style={{
    backgroundColor: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '1.5rem',
    marginBottom: '2rem'
  }}>
    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
      💪 Confidence by Topic
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={confidenceData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
        <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
        <YAxis stroke="var(--color-text-secondary)" domain={[0, 100]} />
        <Tooltip contentStyle={{ backgroundColor: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)' }} />
        <Bar dataKey="confidence" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}

        {/* Task Completion Chart */}
        {tasks.length > 0 && (
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
              🎯 Task Completion
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: taskStats.completed },
                    { name: 'Remaining', value: taskStats.total - taskStats.completed }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Export Button */}
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => navigate(`/export/${goalId}`)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'var(--color-background-info)',
              color: 'var(--color-text-info)',
              border: '0.5px solid var(--color-border-info)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📥 Export Data (PDF/CSV/Calendar)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;