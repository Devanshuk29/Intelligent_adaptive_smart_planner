import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ExportPage = () => {
  const { goalId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(null);
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const fetchGoal = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/goals/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const goalData = res.data.goal || res.data;
      setGoal(goalData);
    } catch (err) {
      console.error('Fetch goal error:', err);
      setError('Failed to load goal');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    setSuccess('');

    try {
      const response = await axios.get(
        `${API_URL}/exports/pdf/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${goal.name}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSuccess('✓ PDF exported successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Export PDF error:', err);
      setError('Failed to export PDF');
    } finally {
      setExporting(null);
    }
  };

  const handleExportCSV = async () => {
    setExporting('csv');
    setSuccess('');

    try {
      const response = await axios.get(
        `${API_URL}/exports/csv/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${goal.name}-data.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSuccess('✓ CSV exported successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Export CSV error:', err);
      setError('Failed to export CSV');
    } finally {
      setExporting(null);
    }
  };

  const handleExportCalendar = async () => {
    setExporting('calendar');
    setSuccess('');

    try {
      const response = await axios.get(
        `${API_URL}/exports/calendar/${goalId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${goal.name}-calendar.ics`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSuccess('✓ Calendar exported successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Export calendar error:', err);
      setError('Failed to export calendar');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate(`/analytics/${goalId}`)}
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
          ← Back to Analytics
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: 0, color: 'var(--color-text-primary)' }}>
          📥 Export Data
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
          {goal?.name} - Download your progress
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        
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
            Choose a format to download your goal progress, milestones, and analytics data.
          </p>
        </div>

        {/* Export Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* PDF Export */}
          <button
            onClick={handleExportPDF}
            disabled={exporting === 'pdf'}
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              cursor: exporting === 'pdf' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 0.5rem', color: 'var(--color-text-primary)' }}>
                  📄 PDF Report
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Professional report with all progress, milestones, and analytics
                </p>
              </div>
              {exporting === 'pdf' ? (
                <span style={{ color: 'var(--color-text-secondary)' }}>Exporting...</span>
              ) : (
                <span style={{ fontSize: '20px' }}>↓</span>
              )}
            </div>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            disabled={exporting === 'csv'}
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              cursor: exporting === 'csv' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 0.5rem', color: 'var(--color-text-primary)' }}>
                  📊 CSV Data
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Spreadsheet format for data analysis and further processing
                </p>
              </div>
              {exporting === 'csv' ? (
                <span style={{ color: 'var(--color-text-secondary)' }}>Exporting...</span>
              ) : (
                <span style={{ fontSize: '20px' }}>↓</span>
              )}
            </div>
          </button>

          {/* Calendar Export */}
          <button
            onClick={handleExportCalendar}
            disabled={exporting === 'calendar'}
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              cursor: exporting === 'calendar' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 0.5rem', color: 'var(--color-text-primary)' }}>
                  📅 Calendar (.ics)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Import milestones into Google Calendar, Outlook, or Apple Calendar
                </p>
              </div>
              {exporting === 'calendar' ? (
                <span style={{ color: 'var(--color-text-secondary)' }}>Exporting...</span>
              ) : (
                <span style={{ fontSize: '20px' }}>↓</span>
              )}
            </div>
          </button>
        </div>

        {/* Info Text */}
        <div style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 1rem', color: 'var(--color-text-primary)' }}>
            💡 How to use:
          </h4>
          <ul style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li><strong>PDF:</strong> Share with mentors or include in applications</li>
            <li><strong>CSV:</strong> Analyze data in Excel or create custom charts</li>
            <li><strong>Calendar:</strong> Track milestone deadlines in your preferred calendar app</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;