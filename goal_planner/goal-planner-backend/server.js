const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const goalsRoutes = require('./routes/goals');
const tasksRoutes = require('./routes/tasks');
const studySessionRoutes = require('./routes/studySessions');
const streakRoutes = require('./routes/streaks');
const confidenceRoutes = require('./routes/confidence');

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/confidence', confidenceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});