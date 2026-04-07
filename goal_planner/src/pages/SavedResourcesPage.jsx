import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const SavedResourcesPage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [deletingResourceId, setDeletingResourceId] = useState(null);

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

      const resourcesRes = await axios.get(
        `${API_URL}/resources/goal/${parseInt(goalId)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const resourcesData = Array.isArray(resourcesRes.data) 
        ? resourcesRes.data 
        : resourcesRes.data.resources || [];

      console.log('Resources:', resourcesData);
      setResources(resourcesData);

    } catch (err) {
      console.error('Fetch data error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load resources';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    setDeletingResourceId(resourceId);

    try {
      await axios.delete(
        `${API_URL}/resources/${resourceId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setResources(resources.filter(r => r.id !== resourceId));

    } catch (err) {
      console.error('Delete resource error:', err);
      setError('Failed to delete resource');
    } finally {
      setDeletingResourceId(null);
    }
  };

  const getUniqueTopics = () => {
    const topics = resources.map(r => r.topic).filter(Boolean);
    return [...new Set(topics)];
  };

  const getFilteredResources = () => {
    if (filterTopic === 'all') return resources;
    return resources.filter(r => r.topic === filterTopic);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading resources...</p>
      </div>
    );
  }

  const filteredResources = getFilteredResources();
  const uniqueTopics = getUniqueTopics();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
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
          📚 Saved Resources
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
          {goal?.name} - Your learning materials
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        
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

        {uniqueTopics.length > 0 && (
          <div style={{
            backgroundColor: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 1rem' }}>
              Filter by topic:
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterTopic('all')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: filterTopic === 'all' ? 'var(--color-background-info)' : 'transparent',
                  color: filterTopic === 'all' ? 'var(--color-text-info)' : 'var(--color-text-secondary)',
                  border: filterTopic === 'all' ? '0.5px solid var(--color-border-info)' : '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                All Topics
              </button>
              {uniqueTopics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setFilterTopic(topic)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: filterTopic === topic ? 'var(--color-background-info)' : 'transparent',
                    color: filterTopic === topic ? 'var(--color-text-info)' : 'var(--color-text-secondary)',
                    border: filterTopic === topic ? '0.5px solid var(--color-border-info)' : '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredResources.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filteredResources.map(resource => (
              <div
                key={resource.id}
                style={{
                  backgroundColor: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {resource.thumbnail && (
                  <div style={{
                    width: '100%',
                    paddingBottom: '56.25%',
                    position: 'relative',
                    backgroundColor: 'var(--color-background-secondary)',
                    backgroundImage: `url(${resource.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                )}

                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: '0 0 0.5rem',
                    color: 'var(--color-text-primary)',
                    lineHeight: '1.4'
                  }}>
                    {resource.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                    {resource.topic && (
                      <div style={{ fontSize: '12px', backgroundColor: 'var(--color-background-info)', color: 'var(--color-text-info)', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block', width: 'fit-content' }}>
                        {resource.topic}
                      </div>
                    )}
                    {resource.channel && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                        {resource.channel}
                      </p>
                    )}
                  </div>

                  {resource.description && (
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      margin: '0 0 1rem',
                      lineHeight: '1.4'
                    }}>
                      {resource.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                    <button
                      onClick={() => window.open(resource.url, '_blank')}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-background-info)',
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
                      onClick={() => handleDeleteResource(resource.id)}
                      disabled={deletingResourceId === resource.id}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: deletingResourceId === resource.id ? 'var(--color-background-secondary)' : 'transparent',
                        color: deletingResourceId === resource.id ? 'var(--color-text-secondary)' : 'var(--color-text-danger)',
                        border: `0.5px solid ${deletingResourceId === resource.id ? 'var(--color-border-secondary)' : 'var(--color-border-danger)'}`,
                        borderRadius: 'var(--border-radius-md)',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: deletingResourceId === resource.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {deletingResourceId === resource.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
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
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', margin: 0 }}>
              No saved resources yet
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
              Search for videos and save them to build your learning library
            </p>
          </div>
        )}

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
            🔍 Search More Resources
          </button>
          <button
            onClick={() => navigate(`/recommendations/${goalId}`)}
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
            ⭐ Smart Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedResourcesPage;