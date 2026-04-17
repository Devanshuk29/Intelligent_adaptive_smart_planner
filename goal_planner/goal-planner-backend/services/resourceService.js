const axios = require('axios');
const pool = require('../config/database');

const searchYouTubeVideos = async (query, maxResults = 12) => {
  try {
    if (!query) {
      throw new Error('Search query is required');
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;

    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured');
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: maxResults,
        order: 'relevance',
        relevanceLanguage: 'en',
        key: youtubeApiKey
      }
    });

    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle || 'Unknown Channel',
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      topic: query
    }));

    console.log(`Found ${videos.length} videos for query: ${query}`);

    return {
      success: true,
      videos: videos,
      count: videos.length
    };

  } catch (error) {
    console.error('YouTube search error:', error.message);
    throw new Error('Failed to search YouTube videos');
  }
};

const saveResource = async (userId, goalId, title, description, url, thumbnail, channel, type, topic) => {
  try {
    if (!userId || !goalId || !title || !url || !topic) {
      throw new Error('Missing required fields: userId, goalId, title, url, topic');
    }

    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalResult.rows.length === 0) {
      throw new Error('Goal not found or does not belong to user');
    }

    const result = await pool.query(
      `INSERT INTO resources (goal_id, topic, type, title, url, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, goal_id, topic, type, title, url, created_at`,
      [goalId, topic, type || 'video', title, url]
    );

    console.log('Resource saved with ID:', result.rows[0].id);

    return {
      success: true,
      resource: result.rows[0]
    };

  } catch (error) {
    console.error('Save resource error:', error.message);
    throw new Error(error.message);
  }
};

const getGoalResources = async (userId, goalId, resourceType = null) => {
  try {
    if (!userId || !goalId) {
      throw new Error('userId and goalId are required');
    }

    console.log('Querying resources - userId:', userId, 'goalId:', goalId);

    const goalCheck = await pool.query(
      'SELECT id FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalCheck.rows.length === 0) {
      throw new Error('Goal not found or does not belong to user');
    }

    let query = `SELECT id, goal_id, topic, type, title, url, created_at 
                 FROM resources WHERE goal_id = $1`;
    let params = [goalId];

    if (resourceType) {
      query += ` AND type = $2`;
      params.push(resourceType);
    }

    query += ` ORDER BY created_at DESC`;

    console.log('Executing query:', query, 'with params:', params);

    const result = await pool.query(query, params);

    console.log(`Found ${result.rows.length} resources for goal ${goalId}`);

    return {
      success: true,
      resources: result.rows || [],
      count: result.rows.length
    };

  } catch (error) {
    console.error('Get resources error:', error.message);
    throw new Error(error.message);
  }
};

const getRecommendedResources = async (userId, goalId) => {
  try {
    if (!userId || !goalId) {
      throw new Error('userId and goalId are required');
    }

    const goalCheck = await pool.query(
      'SELECT id FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalCheck.rows.length === 0) {
      throw new Error('Goal not found or does not belong to user');
    }

    console.log('Fetching recommendations for goal:', goalId);

    const recommendations = {};

    return {
      success: true,
      recommendations: recommendations,
      message: 'All topics are strong! Keep practicing.'
    };

  } catch (error) {
    console.error('Get recommendations error:', error.message);
    throw new Error(error.message);
  }
};

module.exports = { searchYouTubeVideos, saveResource, getGoalResources, getRecommendedResources };