const pool = require('../config/database');

const updateTaskCompletion = async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = req.params.id;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        error: 'Completed must be true or false'
      });
    }

    const taskResult = await pool.query(
      `SELECT tasks.*, goals.user_id 
       FROM tasks 
       JOIN goals ON tasks.goal_id = goals.id 
       WHERE tasks.id = $1`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    const task = taskResult.rows[0];

    if (task.user_id !== userId) {
      return res.status(403).json({
        error: 'You do not have permission to update this task'
      });
    }

    const updateResult = await pool.query(
      `UPDATE tasks 
       SET completed = $1 
       WHERE id = $2 
       RETURNING *`,
      [completed, taskId]
    );

    const updatedTask = updateResult.rows[0];
    const goalId = updatedTask.goal_id;

    const tasksResult = await pool.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
       FROM tasks 
       WHERE goal_id = $1`,
      [goalId]
    );

    const tasksCount = tasksResult.rows[0];
    const totalTasks = parseInt(tasksCount.total);
    const completedTasks = parseInt(tasksCount.completed) || 0;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await pool.query(
      `UPDATE goals 
       SET progress = $1 
       WHERE id = $2`,
      [progressPercentage, goalId]
    );

    res.json({
      message: 'Task updated successfully',
      task: updatedTask,
      goalProgress: {
        completedTasks: completedTasks,
        totalTasks: totalTasks,
        progressPercentage: progressPercentage
      }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'Server error while updating task'
    });
  }
};

const getTasksForGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Goal not found'
      });
    }

    const tasksResult = await pool.query(
      `SELECT * FROM tasks 
       WHERE goal_id = $1 
       ORDER BY due_date ASC`,
      [goalId]
    );

    const totalTasks = tasksResult.rows.length;
    const completedTasks = tasksResult.rows.filter(t => t.completed).length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      message: 'Tasks retrieved successfully',
      goal: goalResult.rows[0],
      tasks: tasksResult.rows,
      progress: {
        completedTasks: completedTasks,
        totalTasks: totalTasks,
        progressPercentage: progressPercentage
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: 'Server error while fetching tasks'
    });
  }
};

const getMilestoneWithTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const milestoneId = req.params.milestoneId;

    const milestoneResult = await pool.query(
      `SELECT milestones.*, goals.user_id 
       FROM milestones 
       JOIN goals ON milestones.goal_id = goals.id 
       WHERE milestones.id = $1`,
      [milestoneId]
    );

    if (milestoneResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Milestone not found'
      });
    }

    const milestone = milestoneResult.rows[0];

    if (milestone.user_id !== userId) {
      return res.status(403).json({
        error: 'You do not have permission to view this milestone'
      });
    }

    const tasksResult = await pool.query(
      `SELECT * FROM tasks 
       WHERE milestone_id = $1 
       ORDER BY due_date ASC`,
      [milestoneId]
    );

    const totalTasks = tasksResult.rows.length;
    const completedTasks = tasksResult.rows.filter(t => t.completed).length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      message: 'Milestone retrieved successfully',
      milestone,
      tasks: tasksResult.rows,
      progress: {
        completedTasks: completedTasks,
        totalTasks: totalTasks,
        progressPercentage: progressPercentage
      }
    });

  } catch (error) {
    console.error('Get milestone error:', error);
    res.status(500).json({
      error: 'Server error while fetching milestone'
    });
  }
};

module.exports = { updateTaskCompletion, getTasksForGoal, getMilestoneWithTasks };