const pool = require('../config/database');
const { searchYouTubeVideos, saveResource, getGoalResources, getRecommendedResources } = require('../services/resourceService');

const searchVideos = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    console.log('Searching for:', query);

    const result = await searchYouTubeVideos(query, 12);

    res.json({
      success: true,
      videos: result.videos,
      count: result.count
    });

  } catch (error) {
    console.error('Search videos error:', error.message);
    res.status(500).json({
      error: error.message || 'Server error while searching videos'
    });
  }
};

const saveResourceToDb = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalId, topicName, resourceType, resourceTitle, resourceUrl } = req.body;

    if (!goalId || !topicName || !resourceType || !resourceTitle || !resourceUrl) {
      return res.status(400).json({
        error: 'goalId, topicName, resourceType, resourceTitle, and resourceUrl are required'
      });
    }

    console.log('Saving resource - user:', userId, 'goal:', goalId, 'topic:', topicName);

    // Convert field names to match service expectations
    const result = await saveResource(
      userId,
      goalId,
      resourceTitle,  // title
      null,           // description
      resourceUrl,    // url
      null,           // thumbnail
      null,           // channel
      resourceType,   // type
      topicName       // topic
    );

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.status(201).json({
      message: 'Resource saved successfully',
      resource: result.resource
    });

  } catch (error) {
    console.error('Save resource error:', error.message);
    res.status(500).json({
      error: error.message || 'Server error while saving resource'
    });
  }
};

const getResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = parseInt(req.params.goalId);

    if (!goalId) {
      return res.status(400).json({
        error: 'goalId is required'
      });
    }

    console.log('Fetching resources for user:', userId, 'goal:', goalId);

    const result = await getGoalResources(userId, goalId, null);

    res.json({
      success: true,
      resources: result.resources,
      count: result.count
    });

  } catch (error) {
    console.error('Get resources error:', error.message);
    res.status(500).json({
      error: error.message || 'Server error while fetching resources'
    });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    if (!goalId) {
      return res.status(400).json({
        error: 'goalId is required'
      });
    }

    console.log('Fetching recommendations for goal:', goalId);

    const result = await getRecommendedResources(userId, goalId);

    res.json({
      success: true,
      recommendations: result.recommendations,
      message: result.message
    });

  } catch (error) {
    console.error('Get recommendations error:', error.message);
    res.status(500).json({
      error: error.message || 'Server error while generating recommendations'
    });
  }
};

const deleteResource = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resourceId } = req.params;

    if (!resourceId) {
      return res.status(400).json({
        error: 'resourceId is required'
      });
    }

    console.log('Deleting resource:', resourceId, 'user:', userId);

    const resourceCheck = await pool.query(
      `SELECT r.id FROM resources r 
       JOIN goals g ON r.goal_id = g.id 
       WHERE r.id = $1 AND g.user_id = $2`,
      [resourceId, userId]
    );

    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Resource not found or does not belong to you'
      });
    }

    const result = await pool.query(
      'DELETE FROM resources WHERE id = $1 RETURNING id',
      [resourceId]
    );

    res.json({
      success: true,
      message: 'Resource deleted successfully',
      resourceId: result.rows[0].id
    });

  } catch (error) {
    console.error('Delete resource error:', error.message);
    res.status(500).json({
      error: error.message || 'Server error while deleting resource'
    });
  }
};

module.exports = { searchVideos, saveResourceToDb, getResources, getRecommendations, deleteResource };