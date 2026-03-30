const { generateStudyPlan, generatePracticeProblems, getLearningTips, analyzeProgress } = require('../services/aiService');

const getStudyPlan = async (req, res) => {
  try {
    const { topicName, currentConfidence, timePerWeek, weeksRemaining } = req.body;

    if (!topicName || currentConfidence === undefined) {
      return res.status(400).json({
        error: 'topicName and currentConfidence are required'
      });
    }

    if (currentConfidence < 0 || currentConfidence > 100) {
      return res.status(400).json({
        error: 'currentConfidence must be between 0 and 100'
      });
    }

    const result = await generateStudyPlan(topicName, currentConfidence, timePerWeek, weeksRemaining);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Study plan generated successfully',
      topic: result.topic,
      confidence: result.confidence,
      studyPlan: result.studyPlan
    });

  } catch (error) {
    console.error('Get study plan error:', error);
    res.status(500).json({
      error: 'Server error while generating study plan'
    });
  }
};

const getPracticeProblems = async (req, res) => {
  try {
    const { topicName, difficulty, count } = req.body;

    if (!topicName || !difficulty) {
      return res.status(400).json({
        error: 'topicName and difficulty are required'
      });
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        error: 'difficulty must be: easy, medium, or hard'
      });
    }

    const result = await generatePracticeProblems(topicName, difficulty, count || 5);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Practice problems generated successfully',
      topic: result.topic,
      difficulty: result.difficulty,
      count: result.count,
      problems: result.problems
    });

  } catch (error) {
    console.error('Get practice problems error:', error);
    res.status(500).json({
      error: 'Server error while generating practice problems'
    });
  }
};

const getTips = async (req, res) => {
  try {
    const { topicName, currentConfidence, learningStyle } = req.body;

    if (!topicName || currentConfidence === undefined) {
      return res.status(400).json({
        error: 'topicName and currentConfidence are required'
      });
    }

    const result = await getLearningTips(topicName, currentConfidence, learningStyle || 'visual');

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }
    
    
    res.json({
      message: 'Learning tips generated successfully',
      topic: result.topic,
      confidence: result.confidence,
      learningStyle: result.learningStyle,
      tips: result.tips
    });

  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({
      error: 'Server error while generating tips'
    });
  }
};

const getProgressAnalysis = async (req, res) => {
  try {
    const { topicName, previousConfidence, currentConfidence, studyHours, tasksCompleted } = req.body;

    if (!topicName || previousConfidence === undefined || currentConfidence === undefined) {
      return res.status(400).json({
        error: 'topicName, previousConfidence, and currentConfidence are required'
      });
    }

    const result = await analyzeProgress(topicName, previousConfidence, currentConfidence, studyHours, tasksCompleted);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Progress analysis generated successfully',
      topic: result.topic,
      improvement: result.improvement,
      analysis: result.analysis
    });

  } catch (error) {
    console.error('Get progress analysis error:', error);
    res.status(500).json({
      error: 'Server error while analyzing progress'
    });
  }
};

module.exports = { getStudyPlan, getPracticeProblems, getTips, getProgressAnalysis };