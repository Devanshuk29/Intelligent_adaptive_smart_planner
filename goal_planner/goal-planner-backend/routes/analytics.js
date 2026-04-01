const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getStudyHours, getConfidence, getGoalCompletion, getStreaks, getDashboard } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/study-hours', verifyToken, getStudyHours);

router.get('/confidence/:goalId', verifyToken, getConfidence);

router.get('/goal-completion', verifyToken, getGoalCompletion);

router.get('/streaks', verifyToken, getStreaks);

router.get('/dashboard', verifyToken, getDashboard);

module.exports = router;