const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { createGoal, getAllGoals, getGoal } = require('../controllers/goalController');


const router = express.Router();

router.post('/', verifyToken, createGoal);

router.get('/', verifyToken, getAllGoals);

router.get('/:id', verifyToken, getGoal);

module.exports = router;