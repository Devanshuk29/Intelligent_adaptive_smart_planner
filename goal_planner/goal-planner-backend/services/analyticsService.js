const pool = require('../config/database');

const getStudyHoursByDay = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'userId is required'
      };
    }

    const result = await pool.query(
      `SELECT 
        DATE(created_at) as study_date,
        EXTRACT(DOW FROM created_at) as day_of_week,
        SUM(duration_minutes) as total_minutes
       FROM study_sessions
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at), EXTRACT(DOW FROM created_at)
       ORDER BY study_date ASC`,
      [userId]
    );

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const chartData = result.rows.map(row => ({
      date: new Date(row.study_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: Math.round((row.total_minutes / 60) * 10) / 10,
      minutes: row.total_minutes
    }));

    const totalMinutes = result.rows.reduce((sum, row) => sum + row.total_minutes, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      success: true,
      data: chartData,
      totalHours: totalHours,
      totalSessions: result.rows.length
    };

  } catch (error) {
    console.error('Get study hours by day error:', error);
    return {
      success: false,
      error: 'Server error while fetching study hours'
    };
  }
};

const getConfidenceProgress = async (userId, goalId) => {
  try {
    if (!userId || !goalId) {
      return {
        success: false,
        error: 'userId and goalId are required'
      };
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      return {
        success: false,
        error: 'Goal not found'
      };
    }

    const topicsResult = await pool.query(
      `SELECT name, confidence FROM topics 
       WHERE goal_id = $1 
       ORDER BY confidence DESC`,
      [goalId]
    );

    const chartData = topicsResult.rows.map(topic => ({
      name: topic.name,
      confidence: topic.confidence,
      level: topic.confidence >= 80 ? 'Expert' : 
             topic.confidence >= 60 ? 'Proficient' :
             topic.confidence >= 40 ? 'Intermediate' :
             topic.confidence >= 20 ? 'Beginner' : 'Learning'
    }));

    const averageConfidence = chartData.length > 0 
      ? Math.round(chartData.reduce((sum, t) => sum + t.confidence, 0) / chartData.length)
      : 0;

    return {
      success: true,
      data: chartData,
      average: averageConfidence,
      totalTopics: chartData.length
    };

  } catch (error) {
    console.error('Get confidence progress error:', error);
    return {
      success: false,
      error: 'Server error while fetching confidence progress'
    };
  }
};

const getGoalCompletionStatus = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'userId is required'
      };
    }

    const result = await pool.query(
      `SELECT 
        id,
        name,
        progress,
        status,
        deadline
       FROM goals
       WHERE user_id = $1
       ORDER BY progress DESC`,
      [userId]
    );

    const chartData = result.rows.map(goal => ({
      id: goal.id,
      name: goal.name,
      progress: goal.progress,
      status: goal.status,
      deadline: goal.deadline,
      remaining: 100 - goal.progress
    }));

    const totalGoals = chartData.length;
    const completedGoals = chartData.filter(g => g.progress === 100).length;
    const inProgressGoals = chartData.filter(g => g.progress > 0 && g.progress < 100).length;
    const notStarted = chartData.filter(g => g.progress === 0).length;
    const averageProgress = totalGoals > 0 
      ? Math.round(chartData.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
      : 0;

    return {
      success: true,
      data: chartData,
      stats: {
        totalGoals: totalGoals,
        completed: completedGoals,
        inProgress: inProgressGoals,
        notStarted: notStarted,
        averageProgress: averageProgress
      }
    };

  } catch (error) {
    console.error('Get goal completion error:', error);
    return {
      success: false,
      error: 'Server error while fetching goal completion'
    };
  }
};

const getStreakStatistics = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'userId is required'
      };
    }

    const result = await pool.query(
      `SELECT current_streak, longest_streak, last_study_date
       FROM streaks
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        success: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: null,
          streakStatus: 'No streak yet'
        },
        stats: {
          motivationLevel: 'Start studying to build a streak!'
        }
      };
    }

    const streak = result.rows[0];

    let motivationLevel;
    if (streak.current_streak >= 30) {
      motivationLevel = 'Amazing! 🔥 Keep it up!';
    } else if (streak.current_streak >= 14) {
      motivationLevel = 'Excellent! 💪 You\'re on fire!';
    } else if (streak.current_streak >= 7) {
      motivationLevel = 'Great! 👍 One week strong!';
    } else if (streak.current_streak >= 3) {
      motivationLevel = 'Good start! 🚀 Keep going!';
    } else {
      motivationLevel = 'Getting there! 💪 Don\'t break the chain!';
    }

    return {
      success: true,
      data: {
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        lastStudyDate: streak.last_study_date,
        streakStatus: streak.current_streak > 0 ? 'Active 🔥' : 'No active streak'
      },
      stats: {
        motivationLevel: motivationLevel,
        streakDifference: streak.longest_streak - streak.current_streak
      }
    };

  } catch (error) {
    console.error('Get streak statistics error:', error);
    return {
      success: false,
      error: 'Server error while fetching streak statistics'
    };
  }
};

const getDashboardSummary = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'userId is required'
      };
    }

    const todayResult = await pool.query(
      `SELECT SUM(duration_minutes) as total_minutes
       FROM study_sessions
       WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [userId]
    );

    const todayMinutes = todayResult.rows[0].total_minutes || 0;
    const todayHours = Math.round((todayMinutes / 60) * 10) / 10;

    const weekResult = await pool.query(
      `SELECT SUM(duration_minutes) as total_minutes
       FROM study_sessions
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [userId]
    );

    const weekMinutes = weekResult.rows[0].total_minutes || 0;
    const weekHours = Math.round((weekMinutes / 60) * 10) / 10;

    const goalsResult = await pool.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN progress = 100 THEN 1 ELSE 0 END) as completed
       FROM goals
       WHERE user_id = $1`,
      [userId]
    );

    const totalGoals = parseInt(goalsResult.rows[0].total) || 0;
    const completedGoals = parseInt(goalsResult.rows[0].completed) || 0;

    const streakResult = await pool.query(
      `SELECT current_streak FROM streaks WHERE user_id = $1`,
      [userId]
    );

    const currentStreak = streakResult.rows.length > 0 ? streakResult.rows[0].current_streak : 0;

    const sessionsResult = await pool.query(
      `SELECT COUNT(*) as total FROM study_sessions WHERE user_id = $1`,
      [userId]
    );

    const totalSessions = parseInt(sessionsResult.rows[0].total) || 0;

    return {
      success: true,
      summary: {
        todayHours: todayHours,
        weekHours: weekHours,
        totalGoals: totalGoals,
        completedGoals: completedGoals,
        currentStreak: currentStreak,
        totalSessions: totalSessions
      }
    };

  } catch (error) {
    console.error('Get dashboard summary error:', error);
    return {
      success: false,
      error: 'Server error while fetching dashboard summary'
    };
  }
};

module.exports = { getStudyHoursByDay, getConfidenceProgress, getGoalCompletionStatus, getStreakStatistics, getDashboardSummary };