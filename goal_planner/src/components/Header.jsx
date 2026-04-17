import React from 'react';
import { useLocation } from 'react-router-dom';
 
const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
 
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return '📊 Dashboard';
    if (path.includes('goals')) return '🎯 Goals';
    if (path.includes('tasks')) return '✅ Tasks';
    if (path.includes('analytics')) return '📊 Analytics';
    if (path.includes('log-study')) return '📚 Log Study Session';
    if (path.includes('confidence')) return '💪 Confidence Tracking';
    if (path.includes('search-resources')) return '💡 Find Resources';
    if (path.includes('progress-check')) return '📈 Progress Check';
    if (path.includes('suggestions')) return '✨ Smart Suggestions';
    return '🏠 Goal Planner';
  };
 
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(90deg, var(--color-background-primary) 0%, var(--color-background-secondary) 100%)',
        borderBottom: '1px solid var(--color-border-tertiary)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Left Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Menu Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: 'var(--color-text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-background-tertiary)';
            e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-background-secondary)';
            e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          ☰
        </button>
 
        {/* Page Title */}
        <div
          style={{
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {getPageTitle()}
        </div>
      </div>
 
      {/* Right Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {/* Search Icon Button */}
        <button
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.3s',
            color: 'var(--color-text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-background-tertiary)';
            e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-background-secondary)';
            e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Search"
        >
          🔍
        </button>
 
        {/* Notifications Icon Button */}
        <button
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.3s',
            color: 'var(--color-text-primary)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-background-tertiary)';
            e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-background-secondary)';
            e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Notifications"
        >
          🔔
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '16px',
              height: '16px',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: 'white',
              fontWeight: '700',
            }}
          >
            3
          </span>
        </button>
 
        {/* Settings Icon Button */}
        <button
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.3s',
            color: 'var(--color-text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-background-tertiary)';
            e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
            e.currentTarget.style.transform = 'translateY(-2px) rotate(20deg)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-background-secondary)';
            e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
            e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Settings"
        >
          ⚙️
        </button>
 
        {/* Profile Avatar */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
          }}
          title="Profile"
        >
          DK
        </div>
      </div>
    </header>
  );
};
 
export default Header;