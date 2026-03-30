const pool = require('../config/database');

const logStudySession = async (userId, goalId, durationMinutes, pomodorosCompleted) => {
  try {
    if (!userId || !goalId || !durationMinutes) {
      return {
        success: false,
        error: 'userId, goalId, and durationMinutes are required'
      };
    }

    if (durationMinutes <= 0) {
      return {
        success: false,
        error: 'Duration must be greater than 0'
      };
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      return {
        success: false,
        error: 'Goal not found or does not belong to user'
      };
    }

    const sessionResult = await pool.query(
      `INSERT INTO study_sessions (user_id, goal_id, duration_minutes, pomodoros_completed)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, goalId, durationMinutes, Math.round(pomodorosCompleted || durationMinutes / 25)]
    );

    const session = sessionResult.rows[0];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekResult = await pool.query(
      `SELECT SUM(duration_minutes) as total_minutes 
       FROM study_sessions 
       WHERE user_id = $1 AND created_at >= $2`,
      [userId, weekAgo]
    );

    const totalMinutesThisWeek = weekResult.rows[0].total_minutes || 0;
    const totalHoursThisWeek = Math.round((totalMinutesThisWeek / 60) * 10) / 10;

    return {
      success: true,
      session,
      weekStats: {
        totalMinutesThisWeek: totalMinutesThisWeek,
        totalHoursThisWeek: totalHoursThisWeek
      }
    };

  } catch (error) {
    console.error('Log study session error:', error);
    return {
      success: false,
      error: 'Server error while logging study session'
    };
  }
};

const getStudyStats = async (userId) => {
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

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekResult = await pool.query(
      `SELECT SUM(duration_minutes) as total_minutes 
       FROM study_sessions 
       WHERE user_id = $1 AND created_at >= $2`,
      [userId, weekAgo]
    );

    const weekMinutes = weekResult.rows[0].total_minutes || 0;
    const weekHours = Math.round((weekMinutes / 60) * 10) / 10;

    const allTimeResult = await pool.query(
      `SELECT SUM(duration_minutes) as total_minutes,
              COUNT(*) as total_sessions,
              SUM(pomodoros_completed) as total_pomodoros
       FROM study_sessions 
       WHERE user_id = $1`,
      [userId]
    );

    const allTimeMinutes = allTimeResult.rows[0].total_minutes || 0;
    const allTimeHours = Math.round((allTimeMinutes / 60) * 10) / 10;
    const totalSessions = allTimeResult.rows[0].total_sessions || 0;
    const totalPomodoros = allTimeResult.rows[0].total_pomodoros || 0;

    return {
      success: true,
      stats: {
        today: {
          minutes: todayMinutes,
          hours: todayHours
        },
        thisWeek: {
          minutes: weekMinutes,
          hours: weekHours
        },
        allTime: {
          minutes: allTimeMinutes,
          hours: allTimeHours,
          sessions: totalSessions,
          pomodoros: totalPomodoros
        }
      }
    };

  } catch (error) {
    console.error('Get study stats error:', error);
    return {
      success: false,
      error: 'Server error while fetching study stats'
    };
  }
};

module.exports = { logStudySession, getStudyStats };