const { logStudySession, getStudyStats } = require('../services/studySessionService');
const { updateStreak } = require('../services/streakService');

const createStudySession = async (req, res) => {
  try {
    const userId = req.userId;
    const { goalId, durationMinutes, pomodorosCompleted } = req.body;

    if (!goalId || !durationMinutes) {
      return res.status(400).json({
        error: 'goalId and durationMinutes are required'
      });
    }

    if (durationMinutes <= 0) {
      return res.status(400).json({
        error: 'Duration must be greater than 0'
      });
    }

    if (pomodorosCompleted && pomodorosCompleted <= 0) {
      return res.status(400).json({
        error: 'Pomodoros completed must be greater than 0'
      });
    }

    const result = await logStudySession(
      userId,
      goalId,
      durationMinutes,
      pomodorosCompleted || Math.round((durationMinutes / 25) * 10) / 10
    );

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    const streakResult = await updateStreak(userId);

    res.status(201).json({
      message: 'Study session logged successfully',
      session: result.session,
      weekStats: result.weekStats,
      streak: streakResult.success ? streakResult.streak : null
    });

  } catch (error) {
    console.error('Create study session error:', error);
    res.status(500).json({
      error: 'Server error while logging study session'
    });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await getStudyStats(userId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Study stats retrieved successfully',
      stats: result.stats
    });

  } catch (error) {
    console.error('Get study stats error:', error);
    res.status(500).json({
      error: 'Server error while fetching study stats'
    });
  }
};

module.exports = { createStudySession, getStats };