const pool = require('../config/database');

const updateTopicConfidence = async (userId, goalId, topicName, confidenceLevel) => {
  try {
    if (!userId || !goalId || !topicName || confidenceLevel === undefined) {
      return {
        success: false,
        error: 'userId, goalId, topicName, and confidenceLevel are required'
      };
    }

    if (confidenceLevel < 0 || confidenceLevel > 100) {
      return {
        success: false,
        error: 'Confidence level must be between 0 and 100'
      };
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      return {
        success: false,
        error: 'Goal not found or does not belong to user'
      };
    }

    const topicResult = await pool.query(
      `SELECT * FROM topics 
       WHERE goal_id = $1 AND name = $2`,
      [goalId, topicName]
    );

    let topic;

    if (topicResult.rows.length === 0) {
      const createResult = await pool.query(
        `INSERT INTO topics (goal_id, name, confidence)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [goalId, topicName, confidenceLevel]
      );
      topic = createResult.rows[0];
    } else {
      const updateResult = await pool.query(
        `UPDATE topics 
         SET confidence = $1
         WHERE goal_id = $2 AND name = $3
         RETURNING *`,
        [confidenceLevel, goalId, topicName]
      );
      topic = updateResult.rows[0];
    }

    let masteryLevel;
    if (confidenceLevel >= 80) {
      masteryLevel = 'Expert';
    } else if (confidenceLevel >= 60) {
      masteryLevel = 'Proficient';
    } else if (confidenceLevel >= 40) {
      masteryLevel = 'Intermediate';
    } else if (confidenceLevel >= 20) {
      masteryLevel = 'Beginner';
    } else {
      masteryLevel = 'Learning';
    }

    return {
      success: true,
      topic: {
        ...topic,
        confidence_level: topic.confidence
      },
      masteryLevel: masteryLevel
    };

  } catch (error) {
    console.error('Update topic confidence error:', error);
    return {
      success: false,
      error: 'Server error while updating topic confidence'
    };
  }
};

const getGoalTopics = async (userId, goalId) => {
  try {
    if (!userId || !goalId) {
      return {
        success: false,
        error: 'userId and goalId are required'
      };
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      return {
        success: false,
        error: 'Goal not found or does not belong to user'
      };
    }

    const topicsResult = await pool.query(
      `SELECT * FROM topics 
       WHERE goal_id = $1 
       ORDER BY confidence DESC`,
      [goalId]
    );

    const topics = topicsResult.rows.map(topic => {
      let masteryLevel;
      if (topic.confidence >= 80) {
        masteryLevel = 'Expert';
      } else if (topic.confidence >= 60) {
        masteryLevel = 'Proficient';
      } else if (topic.confidence >= 40) {
        masteryLevel = 'Intermediate';
      } else if (topic.confidence >= 20) {
        masteryLevel = 'Beginner';
      } else {
        masteryLevel = 'Learning';
      }

      return {
        ...topic,
        confidence_level: topic.confidence,
        masteryLevel: masteryLevel
      };
    });

    let averageConfidence = 0;
    if (topics.length > 0) {
      const totalConfidence = topics.reduce((sum, t) => sum + t.confidence, 0);
      averageConfidence = Math.round(totalConfidence / topics.length);
    }

    const expertCount = topics.filter(t => t.masteryLevel === 'Expert').length;
    const proficientCount = topics.filter(t => t.masteryLevel === 'Proficient').length;
    const intermediateCount = topics.filter(t => t.masteryLevel === 'Intermediate').length;
    const beginnerCount = topics.filter(t => t.masteryLevel === 'Beginner').length;
    const learningCount = topics.filter(t => t.masteryLevel === 'Learning').length;

    return {
      success: true,
      topics: topics,
      summary: {
        totalTopics: topics.length,
        averageConfidence: averageConfidence,
        byMasteryLevel: {
          expert: expertCount,
          proficient: proficientCount,
          intermediate: intermediateCount,
          beginner: beginnerCount,
          learning: learningCount
        }
      }
    };

  } catch (error) {
    console.error('Get goal topics error:', error);
    return {
      success: false,
      error: 'Server error while fetching topics'
    };
  }
};

const getReadinessScore = async (userId, goalId) => {
  try {
    if (!userId || !goalId) {
      return {
        success: false,
        error: 'userId and goalId are required'
      };
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      return {
        success: false,
        error: 'Goal not found or does not belong to user'
      };
    }

    const topicsResult = await pool.query(
      `SELECT * FROM topics WHERE goal_id = $1`,
      [goalId]
    );

    const topics = topicsResult.rows;

    if (topics.length === 0) {
      return {
        success: true,
        readinessScore: 0,
        isReady: false,
        message: 'Start tracking topics to measure readiness'
      };
    }

    const averageConfidence = topics.reduce((sum, t) => sum + t.confidence, 0) / topics.length;

    const expertCount = topics.filter(t => t.confidence >= 80).length;
    const weakTopics = topics.filter(t => t.confidence < 40).length;

    let readinessLevel;
    let isReady = false;

    if (averageConfidence >= 75 && weakTopics === 0) {
      readinessLevel = 'Excellent - Ready for Interview! 🎉';
      isReady = true;
    } else if (averageConfidence >= 60 && weakTopics <= 2) {
      readinessLevel = 'Good - Almost Ready ⚠️';
      isReady = false;
    } else if (averageConfidence >= 40) {
      readinessLevel = 'Fair - More Practice Needed 📚';
      isReady = false;
    } else {
      readinessLevel = 'Needs Work - Keep Studying 💪';
      isReady = false;
    }

    return {
      success: true,
      readinessScore: Math.round(averageConfidence),
      isReady: isReady,
      readinessLevel: readinessLevel,
      stats: {
        averageConfidence: Math.round(averageConfidence),
        expertTopics: expertCount,
        weakTopics: weakTopics,
        totalTopics: topics.length
      }
    };

  } catch (error) {
    console.error('Get readiness score error:', error);
    return {
      success: false,
      error: 'Server error while calculating readiness'
    };
  }
};

module.exports = { updateTopicConfidence, getGoalTopics, getReadinessScore };