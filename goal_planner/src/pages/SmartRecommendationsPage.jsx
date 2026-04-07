import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const SmartRecommendationsPage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingVideoId, setSavingVideoId] = useState(null);
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, [goalId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const goalRes = await axios.get(
        `${API_URL}/goals/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const goalData = goalRes.data.goal || goalRes.data;
      setGoal(goalData);

      const recsRes = await axios.get(
        `${API_URL}/resources/recommendations/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const recsData = recsRes.data.recommendations || recsRes.data;
      console.log('Recommendations:', recsData);
      setRecommendations(recsData);

    } catch (err) {
      console.error('Fetch data error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load recommendations';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResource = async (video, topic) => {
  setSavingVideoId(video.id);
  setSuccess('');

  try {
    await axios.post(
      `${API_URL}/resources`,
      {
        goalId: parseInt(goalId),
        topicName: topic,
        resourceType: 'video',
        resourceTitle: video.title,
        resourceUrl: video.url
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setSuccess(`✓ "${video.title}" saved!`);
    setTimeout(() => setSuccess(''), 2000);

  } catch (err) {
    console.error('Save resource error:', err);
    setError('Failed to save resource');
  } finally {
    setSavingVideoId(null);
  }
};

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading recommendations...</p>
      </div>
    );
  }

  const hasRecommendations = recommendations && Object.keys(recommendations).length > 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate(`/goal/${goalId}`)}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer'
          }}
        >
          ← Back to Goal
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
          ⭐ Smart Recommendations
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
          {goal?.name} - Videos for your weak topics
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Messages */}
        {error && (
          <div style={{
            backgroundColor: 'var(--color-background-danger)',
            border: '0.5px solid var(--color-border-danger)',
            color: 'var(--color-text-danger)',
            padding: '1rem',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'var(--color-background-success)',
            border: '0.5px solid var(--color-border-success)',
            color: 'var(--color-text-success)',
            padding: '1rem',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '2rem'
          }}>
            {success}
          </div>
        )}

        {/* Info Box */}
        <div style={{
          backgroundColor: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            🎯 Based on your confidence levels, here are recommended videos for your weak topics (less than 60% confidence).
          </p>
        </div>

        {/* Recommendations */}
        {hasRecommendations ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {Object.entries(recommendations).map(([topic, videos]) => (
              <div key={topic}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1.5rem', color: 'var(--color-text-primary)' }}>
                  📖 {topic}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {Array.isArray(videos) && videos.map(video => (
                    <div
                      key={video.id}
                      style={{
                        backgroundColor: 'var(--color-background-primary)',
                        border: '0.5px solid var(--color-border-tertiary)',
                        borderRadius: 'var(--border-radius-lg)',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Thumbnail */}
                      <div style={{
                        width: '100%',
                        paddingBottom: '56.25%',
                        position: 'relative',
                        backgroundColor: 'var(--color-background-secondary)',
                        backgroundImage: `url(${video.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(video.url, '_blank')}
                      />

                      {/* Content */}
                      <div style={{ padding: '1rem' }}>
                        <h3 style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          margin: '0 0 0.5rem',
                          color: 'var(--color-text-primary)',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {video.title}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                            {video.channel}
                          </p>
                          {video.duration && (
                            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
                              {video.duration}
                            </p>
                          )}
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => window.open(video.url, '_blank')}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              backgroundColor: 'transparent',
                              color: 'var(--color-text-info)',
                              border: '0.5px solid var(--color-border-info)',
                              borderRadius: 'var(--border-radius-md)',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Watch
                          </button>
                          <button
                            onClick={() => handleSaveResource(video, topic)}
                            disabled={savingVideoId === video.id}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              backgroundColor: savingVideoId === video.id ? 'var(--color-background-secondary)' : 'var(--color-background-success)',
                              color: savingVideoId === video.id ? 'var(--color-text-secondary)' : 'var(--color-text-success)',
                              border: `0.5px solid ${savingVideoId === video.id ? 'var(--color-border-secondary)' : 'var(--color-border-success)'}`,
                              borderRadius: 'var(--border-radius-md)',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: savingVideoId === video.id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {savingVideoId === video.id ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            borderRadius: 'var(--border-radius-lg)',
            border: '0.5px solid var(--color-border-tertiary)',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '16px', color: 'var(--color-text-success)', margin: 0, fontWeight: '600' }}>
              ✅ All topics strong!
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
              You have mastered all topics. Continue practicing to maintain your level.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate(`/search-resources/${goalId}`)}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text-info)',
              border: '0.5px solid var(--color-border-info)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🔍 Search Resources
          </button>
          <button
            onClick={() => navigate(`/saved-resources/${goalId}`)}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: 'var(--color-background-info)',
              color: 'var(--color-text-info)',
              border: '0.5px solid var(--color-border-info)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📚 Saved Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendationsPage;