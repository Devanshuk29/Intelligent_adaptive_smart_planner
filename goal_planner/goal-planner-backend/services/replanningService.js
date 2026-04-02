const pool = require('../config/database');

const calculateProgressStatus = async (goalId) => {
  try {
    if (!goalId) {
      return {
        success: false,
        error: 'goalId is required'
      };
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1',
      [goalId]
    );

    if (goalResult.rows.length === 0) {
      return {
        success: false,
        error: 'Goal not found'
      };
    }

    const goal = goalResult.rows[0];

    const today = new Date();
    const createdDate = new Date(goal.created_at);
    const deadlineDate = new Date(goal.deadline);
    
    const totalTimeMs = deadlineDate - createdDate;
    const elapsedTimeMs = today - createdDate;
    const timeElapsedPercent = Math.round((elapsedTimeMs / totalTimeMs) * 100);

    
    const expectedProgress = Math.min(timeElapsedPercent, 100);
    const actualProgress = goal.progress;
    const progressGap = expectedProgress - actualProgress;

    let status;
    let recommendation;
    let urgency;

    if (progressGap > 20) {
      status = 'Significantly Behind';
      recommendation = 'Urgent: Increase study time immediately';
      urgency = 'critical';
    } else if (progressGap > 10) {
      status = 'Behind Schedule';
      recommendation = 'Increase study hours to catch up';
      urgency = 'high';
    } else if (progressGap > 0) {
      status = 'Slightly Behind';
      recommendation = 'Maintain current pace, you can catch up';
      urgency = 'medium';
    } else if (progressGap === 0) {
      status = 'On Track';
      recommendation = 'Great job! Maintain current pace';
      urgency = 'low';
    } else {
      status = 'Ahead of Schedule';
      recommendation = 'Excellent! You can take it easy';
      urgency = 'low';
    }

    return {
      success: true,
      status: {
        currentStatus: status,
        expectedProgress: expectedProgress,
        actualProgress: actualProgress,
        progressGap: progressGap,
        timeElapsedPercent: timeElapsedPercent,
        recommendation: recommendation,
        urgency: urgency
      }
    };

  } catch (error) {
    console.error('Calculate progress status error:', error);
    return {
      success: false,
      error: 'Server error while calculating progress'
    };
  }
};

const generateReplanSuggestions = async (goalId) => {
  try {
    if (!goalId) {
      return {
        success: false,
        error: 'goalId is required'
      };
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1',
      [goalId]
    );

    if (goalResult.rows.length === 0) {
      return {
        success: false,
        error: 'Goal not found'
      };
    }

    const goal = goalResult.rows[0];

    const statusResult = await calculateProgressStatus(goalId);
    if (!statusResult.success) {
      return statusResult;
    }

    const status = statusResult.status;

    const tasksResult = await pool.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
       FROM tasks
       WHERE goal_id = $1`,
      [goalId]
    );

    const totalTasks = parseInt(tasksResult.rows[0].total) || 0;
    const completedTasks = parseInt(tasksResult.rows[0].completed) || 0;
    const remainingTasks = totalTasks - completedTasks;

    const today = new Date();
    const deadlineDate = new Date(goal.deadline);
    const timeRemainingMs = deadlineDate - today;
    const daysRemaining = Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.ceil(daysRemaining / 7);

    const suggestions = [];

    if (status.progressGap > 0) {
      const suggestedHoursPerWeek = Math.ceil(
        (goal.time_per_week * (100 + status.progressGap)) / 100
      );
      
      suggestions.push({
        type: 'increase_hours',
        title: 'Increase Study Hours',
        current: goal.time_per_week,
        suggested: suggestedHoursPerWeek,
        description: `Increase from ${goal.time_per_week} to ${suggestedHoursPerWeek} hours/week to catch up`
      });

      if (remainingTasks > 0) {
        const avgTimePerTask = (goal.time_per_week * weeksRemaining * 60) / remainingTasks;
        suggestions.push({
          type: 'task_focus',
          title: 'Focus on Critical Tasks',
          taskCount: remainingTasks,
          timePerTask: Math.round(avgTimePerTask),
          description: `Allocate ${Math.round(avgTimePerTask)} minutes per task to complete on time`
        });
      }

      suggestions.push({
        type: 'extend_deadline',
        title: 'Consider Extending Deadline',
        daysRemaining: daysRemaining,
        description: `Current deadline is ${daysRemaining} days away. Consider requesting extension if possible`
      });
    }

    if (status.progressGap <= 0) {
      suggestions.push({
        type: 'maintain_pace',
        title: 'Maintain Current Pace',
        currentHours: goal.time_per_week,
        description: 'You\'re on track or ahead! Maintain your current study schedule'
      });
    }

    return {
      success: true,
      goalInfo: {
        name: goal.name,
        deadline: goal.deadline,
        timePerWeek: goal.time_per_week
      },
      progressInfo: status,
      taskInfo: {
        total: totalTasks,
        completed: completedTasks,
        remaining: remainingTasks
      },
      timeInfo: {
        daysRemaining: daysRemaining,
        weeksRemaining: weeksRemaining
      },
      suggestions: suggestions
    };

  } catch (error) {
    console.error('Generate replan suggestions error:', error);
    return {
      success: false,
      error: 'Server error while generating suggestions'
    };
  }
};

const autoReplanTasks = async (goalId) => {
  try {
    if (!goalId) {
      return {
        success: false,
        error: 'goalId is required'
      };
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1',
      [goalId]
    );

    if (goalResult.rows.length === 0) {
      return {
        success: false,
        error: 'Goal not found'
      };
    }

    const goal = goalResult.rows[0];

    const tasksResult = await pool.query(
      `SELECT * FROM tasks 
       WHERE goal_id = $1 AND completed = false
       ORDER BY due_date ASC`,
      [goalId]
    );

    if (tasksResult.rows.length === 0) {
      return {
        success: true,
        message: 'No tasks to replan'
      };
    }

    const today = new Date();
    const deadlineDate = new Date(goal.deadline);
    const remainingDays = Math.max(1, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)));
    const tasksPerDay = tasksResult.rows.length / remainingDays;

    let updatedCount = 0;
    for (let i = 0; i < tasksResult.rows.length; i++) {
      const newDueDate = new Date(today);
      newDueDate.setDate(newDueDate.getDate() + Math.ceil((i + 1) / tasksPerDay));

      await pool.query(
        `UPDATE tasks 
         SET due_date = $1 
         WHERE id = $2`,
        [newDueDate, tasksResult.rows[i].id]
      );
      updatedCount++;
    }

    return {
      success: true,
      message: `Replanned ${updatedCount} tasks`,
      tasksReplanned: updatedCount,
      newScheduleInfo: {
        remainingDays: remainingDays,
        tasksToComplete: tasksResult.rows.length,
        tasksPerDay: tasksPerDay.toFixed(2)
      }
    };

  } catch (error) {
    console.error('Auto replan tasks error:', error);
    return {
      success: false,
      error: 'Server error while replanning tasks'
    };
  }
};

module.exports = { calculateProgressStatus, generateReplanSuggestions, autoReplanTasks };