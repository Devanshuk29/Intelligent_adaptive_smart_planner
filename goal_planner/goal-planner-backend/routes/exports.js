const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { exportPDF, exportCSV, exportCalendar } = require('../controllers/exportController');

const router = express.Router();

router.get('/pdf/:goalId', verifyToken, exportPDF);
router.get('/csv/:goalId', verifyToken, exportCSV);
router.get('/calendar/:goalId', verifyToken, exportCalendar);

module.exports = router;