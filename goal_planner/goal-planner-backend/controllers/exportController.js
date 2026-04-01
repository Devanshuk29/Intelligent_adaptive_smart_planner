const { generatePDFReport, generateCSVExport, getCalendarEvents } = require('../services/exportService');

const exportPDF = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    if (!goalId) {
      return res.status(400).json({
        error: 'goalId is required'
      });
    }
    
    const result = await generatePDFReport(userId, goalId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    result.doc.pipe(res);
    result.doc.end();

  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({
      error: 'Server error while exporting PDF'
    });
  }
};


const exportCSV = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await generateCSVExport(userId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    res.send(result.csv);

  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      error: 'Server error while exporting CSV'
    });
  }
};

const exportCalendar = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    if (!goalId) {
      return res.status(400).json({
        error: 'goalId is required'
      });
    }

    const result = await getCalendarEvents(userId, goalId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    res.send(result.ical);

  } catch (error) {
    console.error('Export calendar error:', error);
    res.status(500).json({
      error: 'Server error while exporting calendar'
    });
  }
};

module.exports = { exportPDF, exportCSV, exportCalendar };