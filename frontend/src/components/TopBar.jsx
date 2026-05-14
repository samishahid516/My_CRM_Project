import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlineBell, HiOutlineCog, HiOutlineMenu } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

function TopBar({ searchQuery, setSearchQuery, unreadCount, notifications, setNotifications, toggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (emailId) => {
    setShowNotifications(false);
    navigate(`/emails/${emailId}`);
    // Optional: filter out the clicked notification
    setNotifications(prev => prev.filter(n => n.id !== emailId));
  };

  return (
    <header className="topbar">
      <div className="topbar-left-wrapper">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <HiOutlineMenu />
        </button>
        <div className="topbar-search">
          <HiOutlineSearch className="topbar-search-icon" />
          <input
            type="text"
            placeholder="Search emails by sender, subject, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="topbar-actions">
        <div className="notification-wrapper">
          <button 
            className={`topbar-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <HiOutlineBell />
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <h3>Notifications</h3>
                <button onClick={() => setNotifications([])}>Clear All</button>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No new notifications</div>
                ) : (
                  notifications.map((n, i) => (
                    <div 
                      key={i} 
                      className="notification-item"
                      onClick={() => handleNotificationClick(n.id)}
                    >
                      <div className="notification-item-top">
                        <span className={`priority-dot ${n.priority}`}></span>
                        <span className="notification-from">{n.from}</span>
                        <span className="notification-time">just now</span>
                      </div>
                      <div className="notification-subject truncate">{n.subject}</div>
                      <div className="notification-badges">
                        <span className={`badge badge-${n.sentiment}`}>{n.sentiment}</span>
                        <span className={`badge badge-${n.priority}`}>{n.priority}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button className="topbar-btn">
          <HiOutlineCog />
        </button>
        <div className="topbar-avatar">SA</div>
      </div>
    </header>
  );
}

export default TopBar;
