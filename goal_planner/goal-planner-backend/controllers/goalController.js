const pool = require('../config/database');

const createGoal = async (req, res) => {
  try {
    const userId = req.userId;

    const { name, description, deadline, difficulty, time_per_week } = req.body;

    if (!name || !deadline || !difficulty || !time_per_week) {
      return res.status(400).json({
        error: 'Name, deadline, difficulty, and time_per_week are required'
      });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid deadline format. Use YYYY-MM-DD'
      });
    }

    if (deadlineDate < new Date()) {
      return res.status(400).json({
        error: 'Deadline must be in the future'
      });
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        error: 'Difficulty must be: easy, medium, or hard'
      });
    }

    if (time_per_week <= 0 || time_per_week > 168) {
      return res.status(400).json({
        error: 'Hours per week must be between 1 and 168'
      });
    }

    const result = await pool.query(
      `INSERT INTO goals (user_id, name, description, deadline, difficulty, time_per_week, progress, status)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 'in_progress')
       RETURNING id, user_id, name, description, deadline, difficulty, time_per_week, progress, status, created_at`,
      [userId, name, description || null, deadline, difficulty.toLowerCase(), time_per_week]
    );

    const goal = result.rows[0];

    res.status(201).json({
      message: 'Goal created successfully',
      goal
    });

  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      error: 'Server error while creating goal'
    });
  }
};


const getAllGoals = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      message: 'Goals retrieved successfully',
      goals: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      error: 'Server error while fetching goals'
    });
  }
};

const getGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.id;

    const result = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Goal not found'
      });
    }

    res.json({
      message: 'Goal retrieved successfully',
      goal: result.rows[0]
    });

  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({
      error: 'Server error while fetching goal'
    });
  }
};

module.exports = { createGoal, getAllGoals, getGoal };