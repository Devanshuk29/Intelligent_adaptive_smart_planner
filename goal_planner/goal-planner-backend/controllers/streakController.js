const { updateStreak, getUserStreak } = require('../services/streakService');

const updateUserStreak = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await updateStreak(userId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Streak updated successfully',
      streak: result.streak
    });

  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({
      error: 'Server error while updating streak'
    });
  }
};


const getStreak = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await getUserStreak(userId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Streak retrieved successfully',
      streak: result.streak
    });

  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({
      error: 'Server error while fetching streak'
    });
  }
};

module.exports = { updateUserStreak, getStreak };