const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getProgressStatus, getReplanSuggestions, executeAutoReplan } = require('../controllers/replanningController');

const router = express.Router();

router.get('/status/:goalId', verifyToken, getProgressStatus);

router.get('/suggestions/:goalId', verifyToken, getReplanSuggestions);

router.post('/execute/:goalId', verifyToken, executeAutoReplan);

module.exports = router;