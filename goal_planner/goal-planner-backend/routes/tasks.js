const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { updateTaskCompletion, getTasksForGoal, getMilestoneWithTasks } = require('../controllers/taskController');

const router = express.Router();


router.patch('/:id', verifyToken, updateTaskCompletion);

router.get('/goal/:goalId', verifyToken, getTasksForGoal);

router.get('/milestone/:milestoneId', verifyToken, getMilestoneWithTasks);

module.exports = router;