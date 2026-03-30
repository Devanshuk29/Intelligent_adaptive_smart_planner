const axios = require('axios');
const pool = require('../config/database');

const searchYouTubeVideos = async (topicName, maxResults = 5) => {
  try {
    if (!topicName) {
      return {
        success: false,
        error: 'Topic name is required'
      };
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;

    if (!youtubeApiKey) {
      return {
        success: false,
        error: 'YouTube API key not configured'
      };
    }

    const searchQuery = `${topicName} tutorial educational`;

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: maxResults,
        order: 'relevance',
        relevanceLanguage: 'en',
        key: youtubeApiKey
      }
    });

    const videos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle || 'Unknown Channel',
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    return {
      success: true,
      topic: topicName,
      videos: videos,
      count: videos.length
    };

  } catch (error) {
    console.error('YouTube search error:', error.message);
    return {
      success: false,
      error: 'Failed to search YouTube videos'
    };
  }
};

const saveResource = async (userId, goalId, topicName, resourceType, resourceTitle, resourceUrl) => {
  try {
    if (!userId || !goalId || !topicName || !resourceType || !resourceTitle || !resourceUrl) {
      return {
        success: false,
        error: 'All fields are required'
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

    const result = await pool.query(
      `INSERT INTO resources (goal_id, topic, type, title, url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [goalId, topicName, resourceType, resourceTitle, resourceUrl]
    );

    return {
      success: true,
      resource: result.rows[0]
    };

  } catch (error) {
    console.error('Save resource error:', error);
    return {
      success: false,
      error: 'Server error while saving resource'
    };
  }
};

const getGoalResources = async (userId, goalId, resourceType = null) => {
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

    let query = `SELECT * FROM resources WHERE goal_id = $1`;
    let params = [goalId];

    if (resourceType) {
      query += ` AND type = $2`;
      params.push(resourceType);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);

    const resourcesByTopic = {};
    result.rows.forEach(resource => {
      if (!resourcesByTopic[resource.topic]) {
        resourcesByTopic[resource.topic] = [];
      }
      resourcesByTopic[resource.topic].push(resource);
    });

    return {
      success: true,
      total: result.rows.length,
      resources: result.rows,
      byTopic: resourcesByTopic
    };

  } catch (error) {
    console.error('Get resources error:', error);
    return {
      success: false,
      error: 'Server error while fetching resources'
    };
  }
};

const getRecommendedResources = async (userId, goalId) => {
  try {
    if (!userId || !goalId) {
      return {
        success: false,
        error: 'userId and goalId are required'
      };
    }

    const topicsResult = await pool.query(
      `SELECT * FROM topics WHERE goal_id = $1 ORDER BY confidence ASC`,
      [goalId]
    );

    if (topicsResult.rows.length === 0) {
      return {
        success: true,
        recommendations: [],
        message: 'No topics tracked yet. Add topics to get recommendations.'
      };
    }

    const weakTopics = topicsResult.rows.filter(t => t.confidence < 60);
    const priorityTopics = weakTopics.length > 0 ? weakTopics : topicsResult.rows.slice(0, 3);

    const recommendations = [];

    for (const topic of priorityTopics) {
      const videoResult = await searchYouTubeVideos(topic.name, 3);

      if (videoResult.success && videoResult.videos.length > 0) {
        recommendations.push({
          topic: topic.name,
          confidence: topic.confidence,
          priority: topic.confidence < 40 ? 'High' : 'Medium',
          videos: videoResult.videos
        });
      }
    }

    return {
      success: true,
      recommendations: recommendations,
      message: recommendations.length > 0 
        ? 'Here are recommended resources for your weak topics'
        : 'All topics are strong! Keep practicing.'
    };

  } catch (error) {
    console.error('Get recommendations error:', error);
    return {
      success: false,
      error: 'Server error while generating recommendations'
    };
  }
};

module.exports = { searchYouTubeVideos, saveResource, getGoalResources, getRecommendedResources };
