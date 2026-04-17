import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
 
const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const isActive = (path) => {
    return location.pathname.includes(path);
  };
 
  const navigationItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard', category: 'Main' },
    { label: 'Goals', icon: '🎯', path: '/goals', category: 'Main' },
    { label: 'Tasks', icon: '✅', path: '/tasks', category: 'Main' },
    { label: 'Analytics', icon: '📊', path: '/analytics', category: 'Main' },
    { label: 'Log Study', icon: '📚', path: '/log-study-session', category: 'Learning' },
    { label: 'Confidence', icon: '💪', path: '/confidence', category: 'Learning' },
    { label: 'Resources', icon: '💡', path: '/search-resources', category: 'Learning' },
    { label: 'Progress Check', icon: '📈', path: '/progress-check', category: 'Progress' },
    { label: 'Suggestions', icon: '✨', path: '/suggestions', category: 'Progress' },
  ];
 
  const groupedItems = {
    Main: navigationItems.filter(item => item.category === 'Main'),
    Learning: navigationItems.filter(item => item.category === 'Learning'),
    Progress: navigationItems.filter(item => item.category === 'Progress'),
  };
 
  const handleNavClick = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };
 
  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 98,
            display: 'none',
          }}
          onClickCapture={() => setIsOpen(false)}
        />
      )}
 
      {/* Sidebar */}
      <div
        className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{
          position: 'fixed',
          left: 0,
          top: 60,
          height: 'calc(100vh - 60px)',
          width: isOpen ? '280px' : '70px',
          background: 'linear-gradient(180deg, var(--color-background-secondary) 0%, var(--color-background-primary) 100%)',
          borderRight: '1px solid var(--color-border-tertiary)',
          padding: isOpen ? '1.5rem 0' : '1rem 0',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 99,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Navigation Sections */}
        {Object.entries(groupedItems).map(([categoryName, items]) => (
          <div key={categoryName} className="nav-section" style={{ padding: isOpen ? '0 0.75rem 1.5rem' : '0 0.5rem 1.5rem' }}>
            {isOpen && (
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  padding: '0.75rem 0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                {categoryName}
              </div>
            )}
            {items.map((item) => (
              <div
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                title={!isOpen ? item.label : ''}
                style={{
                  padding: isOpen ? '0.9rem 0.75rem' : '0.9rem 0.5rem',
                  margin: '0.25rem 0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isOpen ? '0.75rem' : '0',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: isActive(item.path) ? 'white' : 'var(--color-text-secondary)',
                  border: isActive(item.path) ? '1px solid #1D4ED8' : '1px solid transparent',
                  background: isActive(item.path)
                    ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
                    : 'transparent',
                  boxShadow: isActive(item.path) ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'var(--color-background-secondary)';
                    e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                {isOpen && <span style={{ fontWeight: isActive(item.path) ? '600' : '500' }}>{item.label}</span>}
                {isActive(item.path) && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      background: 'white',
                      borderRadius: '0 2px 2px 0',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
 
        {/* Footer - User Card */}
        <div
          style={{
            padding: isOpen ? '1rem 0.75rem' : '1rem 0.5rem',
            marginTop: 'auto',
            borderTop: '1px solid var(--color-border-tertiary)',
          }}
        >
          <div
            style={{
              padding: isOpen ? '0.75rem' : '0.5rem',
              background: 'var(--color-background-secondary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: isOpen ? '0.75rem' : '0',
              justifyContent: isOpen ? 'flex-start' : 'center',
              transition: 'all 0.3s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'var(--color-background-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'var(--color-background-secondary)';
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '12px',
                flexShrink: 0,
              }}
            >
              DK
            </div>
            {isOpen && (
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  You
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  Online
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Mobile Overlay */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};
 
export default Sidebar;