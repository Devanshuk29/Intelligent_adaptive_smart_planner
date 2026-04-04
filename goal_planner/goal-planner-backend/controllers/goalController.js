/*const pool = require('../config/database');
const { generateRoadmap } = require('../services/roadmapGenerator');


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

    const roadmapResult = generateRoadmap(deadline, difficulty.toLowerCase(), time_per_week);
    
    if (!roadmapResult.success) {
      return res.status(400).json({
        error: roadmapResult.error
      });
    }

    const goalResult = await pool.query(
      `INSERT INTO goals (user_id, name, description, deadline, difficulty, time_per_week, progress, status)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 'in_progress')
       RETURNING id, user_id, name, description, deadline, difficulty, time_per_week, progress, status, created_at`,
      [userId, name, description || null, deadline, difficulty.toLowerCase(), time_per_week]
    );

    const goal = goalResult.rows[0];
    const goalId = goal.id;

    for (const milestone of roadmapResult.milestones) {
    
      const milestoneResult = await pool.query(
        `INSERT INTO milestones (goal_id, name, start_date, end_date, completed)
         VALUES ($1, $2, $3, $4, false)
         RETURNING id`,
        [goalId, milestone.name, milestone.startDate, milestone.endDate]
      );

      const milestoneId = milestoneResult.rows[0].id;

      for (const task of milestone.tasks) {
        await pool.query(
          `INSERT INTO tasks (goal_id, milestone_id, name, description, estimated_time, due_date, completed)
           VALUES ($1, $2, $3, $4, $5, $6, false)`,
          [goalId, milestoneId, task.name, null, task.estimatedHours, task.endDate]
        );
      }
    }

    res.status(201).json({
      message: 'Goal created successfully with roadmap',
      goal,
      roadmap: {
        totalWeeks: roadmapResult.totalWeeks,
        totalHours: roadmapResult.totalHours,
        milestonesCount: roadmapResult.milestonesCount,
        milestones: roadmapResult.milestones
      }
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

module.exports = { createGoal, getAllGoals, getGoal };*/
const pool = require('../config/database');
const { generateRoadmap } = require('../services/roadmapGenerator');


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

    const roadmapResult = generateRoadmap(deadline, difficulty.toLowerCase(), time_per_week);
    
    if (!roadmapResult.success) {
      return res.status(400).json({
        error: roadmapResult.error
      });
    }

    const goalResult = await pool.query(
      `INSERT INTO goals (user_id, name, description, deadline, difficulty, time_per_week, progress, status)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 'in_progress')
       RETURNING id, user_id, name, description, deadline, difficulty, time_per_week, progress, status, created_at`,
      [userId, name, description || null, deadline, difficulty.toLowerCase(), time_per_week]
    );

    const goal = goalResult.rows[0];
    const goalId = goal.id;

    for (const milestone of roadmapResult.milestones) {
    
      const milestoneResult = await pool.query(
        `INSERT INTO milestones (goal_id, name, start_date, end_date, completed)
         VALUES ($1, $2, $3, $4, false)
         RETURNING id`,
        [goalId, milestone.name, milestone.startDate, milestone.endDate]
      );

      const milestoneId = milestoneResult.rows[0].id;

      for (const task of milestone.tasks) {
        await pool.query(
          `INSERT INTO tasks (goal_id, milestone_id, name, description, estimated_time, due_date, completed)
           VALUES ($1, $2, $3, $4, $5, $6, false)`,
          [goalId, milestoneId, task.name, null, task.estimatedHours, task.endDate]
        );
      }
    }

    res.status(201).json({
      message: 'Goal created successfully with roadmap',
      goal,
      roadmap: {
        totalWeeks: roadmapResult.totalWeeks,
        totalHours: roadmapResult.totalHours,
        milestonesCount: roadmapResult.milestonesCount,
        milestones: roadmapResult.milestones
      }
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

    // Get goal
    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Goal not found'
      });
    }

    const goal = goalResult.rows[0];

    // Get milestones for this goal
    const milestonesResult = await pool.query(
      `SELECT id, goal_id, name, start_date, end_date, completed
       FROM milestones 
       WHERE goal_id = $1
       ORDER BY start_date ASC`,
      [goalId]
    );

    goal.milestones = milestonesResult.rows || [];

    console.log(`Goal ${goalId} fetched with ${goal.milestones.length} milestones`);

    res.json({
      message: 'Goal retrieved successfully',
      goal
    });

  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({
      error: 'Server error while fetching goal'
    });
  }
};

module.exports = { createGoal, getAllGoals, getGoal };