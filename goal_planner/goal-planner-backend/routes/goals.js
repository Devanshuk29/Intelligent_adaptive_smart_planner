const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { createGoal, getAllGoals, getGoal, deleteGoal } = require('../controllers/goalController');

const router = express.Router();

router.post('/', verifyToken, createGoal);

router.get('/', verifyToken, getAllGoals);

router.get('/:id', verifyToken, getGoal);

router.delete('/:id', verifyToken, deleteGoal);

module.exports = router;