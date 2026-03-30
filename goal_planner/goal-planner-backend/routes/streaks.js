const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { updateUserStreak, getStreak } = require('../controllers/streakController');

const router = express.Router();


router.patch('/', verifyToken, updateUserStreak);

router.get('/', verifyToken, getStreak);

module.exports = router;