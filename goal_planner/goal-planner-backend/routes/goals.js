const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, (req, res) => {
  const userId = req.userId;
  const { name, description, deadline, difficulty, time_per_week } = req.body;
  
  res.json({ 
    message: 'Goal created (testing)',
    userId: userId,
    goal: { name, description, deadline, difficulty, time_per_week }
  });
});

router.get('/', verifyToken, (req, res) => {
  const userId = req.userId;
  res.json({ 
    message: 'Getting goals for user',
    userId: userId
  });
});

module.exports = router;