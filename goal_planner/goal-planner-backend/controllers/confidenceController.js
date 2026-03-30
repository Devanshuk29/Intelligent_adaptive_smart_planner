const { updateTopicConfidence, getGoalTopics, getReadinessScore } = require('../services/confidenceService');

const updateConfidence = async (req, res) => {
  try {
    const userId = req.userId;
    const { goalId, topicName, confidenceLevel } = req.body;

    if (!goalId || !topicName || confidenceLevel === undefined) {
      return res.status(400).json({
        error: 'goalId, topicName, and confidenceLevel are required'
      });
    }

    if (typeof confidenceLevel !== 'number') {
      return res.status(400).json({
        error: 'confidenceLevel must be a number'
      });
    }

    const result = await updateTopicConfidence(userId, goalId, topicName, confidenceLevel);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Topic confidence updated successfully',
      topic: result.topic,
      masteryLevel: result.masteryLevel
    });

  } catch (error) {
    console.error('Update confidence error:', error);
    res.status(500).json({
      error: 'Server error while updating confidence'
    });
  }
};


const getTopics = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    const result = await getGoalTopics(userId, goalId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Topics retrieved successfully',
      topics: result.topics,
      summary: result.summary
    });

  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      error: 'Server error while fetching topics'
    });
  }
};

const getReadiness = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    const result = await getReadinessScore(userId, goalId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Readiness score calculated successfully',
      readinessScore: result.readinessScore,
      isReady: result.isReady,
      readinessLevel: result.readinessLevel,
      stats: result.stats
    });

  } catch (error) {
    console.error('Get readiness error:', error);
    res.status(500).json({
      error: 'Server error while calculating readiness'
    });
  }
};

module.exports = { updateConfidence, getTopics, getReadiness };