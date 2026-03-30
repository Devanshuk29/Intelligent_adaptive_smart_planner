const { searchYouTubeVideos, saveResource, getGoalResources, getRecommendedResources } = require('../services/resourceService');

const searchVideos = async (req, res) => {
  try {
    const { topicName, maxResults } = req.body;

    if (!topicName) {
      return res.status(400).json({
        error: 'topicName is required'
      });
    }

    const result = await searchYouTubeVideos(topicName, maxResults || 5);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Videos found successfully',
      topic: result.topic,
      videos: result.videos,
      count: result.count
    });

  } catch (error) {
    console.error('Search videos error:', error);
    res.status(500).json({
      error: 'Server error while searching videos'
    });
  }
};

const saveResourceToDb = async (req, res) => {
  try {
    const userId = req.userId;
    const { goalId, topicName, resourceType, resourceTitle, resourceUrl, description } = req.body;

    if (!goalId || !topicName || !resourceType || !resourceTitle || !resourceUrl) {
      return res.status(400).json({
        error: 'goalId, topicName, resourceType, resourceTitle, and resourceUrl are required'
      });
    }

    const result = await saveResource(userId, goalId, topicName, resourceType, resourceTitle, resourceUrl, description);

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
    console.error('Save resource error:', error);
    res.status(500).json({
      error: 'Server error while saving resource'
    });
  }
};

const getResources = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;
    const resourceType = req.query.type || null;

    const result = await getGoalResources(userId, goalId, resourceType);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: 'Resources retrieved successfully',
      total: result.total,
      resources: result.resources,
      byTopic: result.byTopic
    });

  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      error: 'Server error while fetching resources'
    });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    const result = await getRecommendedResources(userId, goalId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      message: result.message,
      recommendations: result.recommendations,
      totalRecommendations: result.recommendations.length
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      error: 'Server error while generating recommendations'
    });
  }
};

module.exports = { searchVideos, saveResourceToDb, getResources, getRecommendations };