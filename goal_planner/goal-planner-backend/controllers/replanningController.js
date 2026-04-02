const { calculateProgressStatus, generateReplanSuggestions, autoReplanTasks } = require('../services/replanningService');

const getProgressStatus = async (req, res) => {
  try {
    const goalId = req.params.goalId;

    if (!goalId) {
      return res.status(400).json({
        error: 'goalId is required'
      });
    }

    const result = await calculateProgressStatus(goalId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Progress status retrieved successfully',
      status: result.status
    });

  } catch (error) {
    console.error('Get progress status error:', error);
    res.status(500).json({
      error: 'Server error while calculating progress status'
    });
  }
};

const getReplanSuggestions = async (req, res) => {
  try {
    const goalId = req.params.goalId;

    if (!goalId) {
      return res.status(400).json({
        error: 'goalId is required'
      });
    }

    const result = await generateReplanSuggestions(goalId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Replan suggestions generated successfully',
      goalInfo: result.goalInfo,
      progressInfo: result.progressInfo,
      taskInfo: result.taskInfo,
      timeInfo: result.timeInfo,
      suggestions: result.suggestions
    });

  } catch (error) {
    console.error('Get replan suggestions error:', error);
    res.status(500).json({
      error: 'Server error while generating suggestions'
    });
  }
};

const executeAutoReplan = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    if (!goalId) {
      return res.status(400).json({
        error: 'goalId is required'
      });
    }

    const pool = require('../config/database');
    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Goal not found or does not belong to user'
      });
    }

    const result = await autoReplanTasks(goalId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Tasks replanned successfully',
      tasksReplanned: result.tasksReplanned,
      newScheduleInfo: result.newScheduleInfo
    });

  } catch (error) {
    console.error('Execute auto replan error:', error);
    res.status(500).json({
      error: 'Server error while replanning tasks'
    });
  }
};

module.exports = { getProgressStatus, getReplanSuggestions, executeAutoReplan };