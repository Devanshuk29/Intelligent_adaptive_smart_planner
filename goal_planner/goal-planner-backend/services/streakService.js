const pool = require('../config/database');

const updateStreak = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'userId is required'
      };
    }

    const streakResult = await pool.query(
      'SELECT * FROM streaks WHERE user_id = $1',
      [userId]
    );

    let currentStreak;
    let longestStreak;
    let lastStudyDate;

    if (streakResult.rows.length === 0) {
      currentStreak = 1;
      longestStreak = 1;
      lastStudyDate = new Date();

      await pool.query(
        `INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date)
         VALUES ($1, $2, $3, $4)`,
        [userId, currentStreak, longestStreak, lastStudyDate]
      );

      return {
        success: true,
        streak: {
          currentStreak: currentStreak,
          longestStreak: longestStreak,
          lastStudyDate: lastStudyDate,
          status: 'New streak started! 🔥'
        }
      };
    }

    const streak = streakResult.rows[0];
    currentStreak = streak.current_streak;
    longestStreak = streak.longest_streak;
    lastStudyDate = new Date(streak.last_study_date);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastStudyDate.setHours(0, 0, 0, 0);

    const daysSinceLastStudy = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));

    let newCurrentStreak = currentStreak;
    let newLongestStreak = longestStreak;
    let streakStatus = '';

    if (daysSinceLastStudy === 0) {
      streakStatus = 'You already studied today! Keep it up! 💪';
    } else if (daysSinceLastStudy === 1) {
      newCurrentStreak = currentStreak + 1;
      streakStatus = `Streak increased to ${newCurrentStreak} days! 🔥`;
    } else if (daysSinceLastStudy > 1) {
      newCurrentStreak = 1;
      streakStatus = 'Streak broken, but you got this! Starting fresh 💪';
    }


    if (newCurrentStreak > longestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    const updateResult = await pool.query(
      `UPDATE streaks 
       SET current_streak = $1, longest_streak = $2, last_study_date = $3
       WHERE user_id = $4
       RETURNING *`,
      [newCurrentStreak, newLongestStreak, new Date(), userId]
    );

    return {
      success: true,
      streak: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastStudyDate: updateResult.rows[0].last_study_date,
        status: streakStatus
      }
    };

  } catch (error) {
    console.error('Update streak error:', error);
    return {
      success: false,
      error: 'Server error while updating streak'
    };
  }
};

const getUserStreak = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'userId is required'
      };
    }

    const result = await pool.query(
      'SELECT * FROM streaks WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        success: true,
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: null,
          message: 'No streak yet. Start studying to begin your streak! 🚀'
        }
      };
    }

    const streak = result.rows[0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastStudyDate = new Date(streak.last_study_date);
    lastStudyDate.setHours(0, 0, 0, 0);

    const daysSinceLastStudy = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));

    let streakStatus = '';
    if (daysSinceLastStudy === 0) {
      streakStatus = 'Active today! Keep it up! 🔥';
    } else if (daysSinceLastStudy === 1) {
      streakStatus = 'Study today to keep the streak alive! ⏰';
    } else {
      streakStatus = 'Streak broken. Start a new one! 💪';
    }

    return {
      success: true,
      streak: {
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        lastStudyDate: streak.last_study_date,
        daysSinceLastStudy: daysSinceLastStudy,
        status: streakStatus
      }
    };

  } catch (error) {
    console.error('Get streak error:', error);
    return {
      success: false,
      error: 'Server error while fetching streak'
    };
  }
};

module.exports = { updateStreak, getUserStreak };