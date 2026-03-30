const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { updateConfidence, getTopics, getReadiness } = require('../controllers/confidenceController');

const router = express.Router();

router.post('/', verifyToken, updateConfidence);

router.get('/goal/:goalId/topics', verifyToken, getTopics);

router.get('/goal/:goalId/readiness', verifyToken, getReadiness);

module.exports = router;