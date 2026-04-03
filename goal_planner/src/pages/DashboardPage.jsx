import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [studyHours, setStudyHours] = useState(null);
  const [goals, setGoals] = useState([]);
  const [streaks, setStreaks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const dashboardRes = await axios.get(`${API_URL}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(dashboardRes.data.summary);

        const hoursRes = await axios.get(`${API_URL}/analytics/study-hours`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudyHours(hoursRes.data.chartData);

        const goalsRes = await axios.get(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Goals response:', goalsRes.data);
        setGoals(goalsRes.data.goals || goalsRes.data || []);

        const streaksRes = await axios.get(`${API_URL}/streaks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStreaks(streaksRes.data.data);

        setError('');
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token, API_URL]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  }

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  const goalPieData = [
    { name: 'Completed', value: goals.filter(g => g.progress === 100).length },
    { name: 'In Progress', value: goals.filter(g => g.progress > 0 && g.progress < 100).length },
    { name: 'Not Started', value: goals.filter(g => g.progress === 0).length }
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Goal Planner</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/create-goal')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              + New Goal
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Today's Study</p>
            <p className="text-3xl font-bold text-blue-500">{dashboardData?.todayHours || 0}h</p>
            <p className="text-gray-500 text-xs mt-2">Hours studied today</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">This Week</p>
            <p className="text-3xl font-bold text-purple-500">{dashboardData?.weekHours || 0}h</p>
            <p className="text-gray-500 text-xs mt-2">Total hours this week</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Current Streak</p>
            <p className="text-3xl font-bold text-orange-500">{streaks?.currentStreak || 0} 🔥</p>
            <p className="text-gray-500 text-xs mt-2">Days in a row</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Goals</p>
            <p className="text-3xl font-bold text-green-500">{dashboardData?.totalGoals || 0}</p>
            <p className="text-gray-500 text-xs mt-2">{dashboardData?.completedGoals || 0} completed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {studyHours && studyHours.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Study Hours (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studyHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3B82F6" name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {goalPieData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Goals Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={goalPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {goalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {goals.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Goals</h2>
            <div className="space-y-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => navigate(`/goal/${goal.id}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{goal.name}</h3>
                      <p className="text-sm text-gray-600">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      goal.progress === 100 ? 'bg-green-100 text-green-800' :
                      goal.progress > 50 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {goals.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No goals yet. Create your first goal to get started!</p>
            <button
              onClick={() => navigate('/create-goal')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Create First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;