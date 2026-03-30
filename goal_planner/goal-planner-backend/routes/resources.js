const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { searchVideos, saveResourceToDb, getResources, getRecommendations } = require('../controllers/resourceController');

/**
 * RESOURCE ROUTES
 * All routes protected with verifyToken middleware
 */
const router = express.Router();

router.post('/search', verifyToken, searchVideos);

router.post('/', verifyToken, saveResourceToDb);

router.get('/goal/:goalId', verifyToken, getResources);

router.get('/recommendations/:goalId', verifyToken, getRecommendations);

module.exports = router;