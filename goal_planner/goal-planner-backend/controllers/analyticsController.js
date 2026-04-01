const { getStudyHoursByDay, getConfidenceProgress, getGoalCompletionStatus, getStreakStatistics, getDashboardSummary } = require('../services/analyticsService');

const getStudyHours = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await getStudyHoursByDay(userId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Study hours retrieved successfully',
      chartData: result.data,
      summary: {
        totalHours: result.totalHours,
        totalSessions: result.totalSessions
      }
    });

  } catch (error) {
    console.error('Get study hours error:', error);
    res.status(500).json({
      error: 'Server error while fetching study hours'
    });
  }
};

const getConfidence = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    if (!goalId) {
      return res.status(400).json({
        error: 'goalId is required'
      });
    }

    const result = await getConfidenceProgress(userId, goalId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Confidence progress retrieved successfully',
      chartData: result.data,
      summary: {
        average: result.average,
        totalTopics: result.totalTopics
      }
    });

  } catch (error) {
    console.error('Get confidence error:', error);
    res.status(500).json({
      error: 'Server error while fetching confidence progress'
    });
  }
};

const getGoalCompletion = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await getGoalCompletionStatus(userId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Goal completion retrieved successfully',
      chartData: result.data,
      stats: result.stats
    });

  } catch (error) {
    console.error('Get goal completion error:', error);
    res.status(500).json({
      error: 'Server error while fetching goal completion'
    });
  }
};

const getStreaks = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await getStreakStatistics(userId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Streak statistics retrieved successfully',
      data: result.data,
      stats: result.stats
    });

  } catch (error) {
    console.error('Get streaks error:', error);
    res.status(500).json({
      error: 'Server error while fetching streak statistics'
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await getDashboardSummary(userId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Dashboard summary retrieved successfully',
      summary: result.summary
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Server error while fetching dashboard summary'
    });
  }
};

module.exports = { getStudyHours, getConfidence, getGoalCompletion, getStreaks, getDashboard };