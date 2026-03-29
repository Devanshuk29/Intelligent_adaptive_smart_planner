const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { createStudySession, getStats } = require('../controllers/studySessionController');

const router = express.Router();

router.post('/', verifyToken, createStudySession);

router.get('/stats', verifyToken, getStats);

module.exports = router;