const express = require('express');
const { verifyToken } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

router.get('/goal/:goalId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    if (!goalId) {
      return res.status(400).json({
        error: 'goalId is required'
      });
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Goal not found or does not belong to user'
      });
    }

    const milestonesResult = await pool.query(
      `SELECT 
        id,
        goal_id,
        name,
        start_date,
        end_date,
        completed,
        created_at
       FROM milestones
       WHERE goal_id = $1
       ORDER BY start_date ASC`,
      [goalId]
    );

    const milestones = milestonesResult.rows;

    res.json({
      message: 'Milestones retrieved successfully',
      milestones: milestones,
      totalMilestones: milestones.length,
      completedMilestones: milestones.filter(m => m.completed).length
    });

  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({
      error: 'Server error while fetching milestones'
    });
  }
});

router.get('/:milestoneId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { milestoneId } = req.params;

    const milestoneResult = await pool.query(
      `SELECT m.* FROM milestones m
       INNER JOIN goals g ON m.goal_id = g.id
       WHERE m.id = $1 AND g.user_id = $2`,
      [milestoneId, userId]
    );

    if (milestoneResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Milestone not found'
      });
    }

    const milestone = milestoneResult.rows[0];

    const tasksResult = await pool.query(
      `SELECT * FROM tasks
       WHERE milestone_id = $1
       ORDER BY created_at ASC`,
      [milestoneId]
    );

    const tasks = tasksResult.rows;
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      message: 'Milestone retrieved successfully',
      milestone: milestone,
      tasks: tasks,
      progress: {
        completedTasks: completedTasks,
        totalTasks: totalTasks,
        progressPercentage: progress
      }
    });

  } catch (error) {
    console.error('Get milestone error:', error);
    res.status(500).json({
      error: 'Server error while fetching milestone'
    });
  }
});

router.patch('/:milestoneId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { milestoneId } = req.params;
    const { completed } = req.body;

    if (completed === undefined) {
      return res.status(400).json({
        error: 'completed status is required'
      });
    }

    const milestoneResult = await pool.query(
      `SELECT m.* FROM milestones m
       INNER JOIN goals g ON m.goal_id = g.id
       WHERE m.id = $1 AND g.user_id = $2`,
      [milestoneId, userId]
    );

    if (milestoneResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Milestone not found'
      });
    }

    const updateResult = await pool.query(
      `UPDATE milestones
       SET completed = $1
       WHERE id = $2
       RETURNING *`,
      [completed, milestoneId]
    );

    res.json({
      message: 'Milestone updated successfully',
      milestone: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({
      error: 'Server error while updating milestone'
    });
  }
});

module.exports = router;