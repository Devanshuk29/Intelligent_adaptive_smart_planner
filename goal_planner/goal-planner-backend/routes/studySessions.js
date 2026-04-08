const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { createStudySession, getStats, getStudySessionsForGoal } = require('../controllers/studySessionController');

const router = express.Router();

router.get('/goal/:goalId', verifyToken, getStudySessionsForGoal);

router.post('/', verifyToken, createStudySession);
router.get('/stats', verifyToken, getStats);

module.exports = router;