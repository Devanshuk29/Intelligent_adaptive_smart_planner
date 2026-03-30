const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getStudyPlan, getPracticeProblems, getTips, getProgressAnalysis } = require('../controllers/aiController');

const router = express.Router();

router.post('/study-plan', verifyToken, getStudyPlan);

router.post('/practice-problems', verifyToken, getPracticeProblems);

router.post('/tips', verifyToken, getTips);

router.post('/progress-analysis', verifyToken, getProgressAnalysis);

module.exports = router;