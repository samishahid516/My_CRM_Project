import React from 'react';
import { HiOutlineSearch, HiOutlineBell, HiOutlineCog } from 'react-icons/hi';

function TopBar({ searchQuery, setSearchQuery, unreadCount }) {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <HiOutlineSearch className="topbar-search-icon" />
        <input
          type="text"
          placeholder="Search emails by sender, subject, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="topbar-actions">
        <button className="topbar-btn">
          <HiOutlineBell />
          {unreadCount > 0 && <span className="notification-dot"></span>}
        </button>
        <button className="topbar-btn">
          <HiOutlineCog />
        </button>
        <div className="topbar-avatar">SA</div>
      </div>
    </header>
  );
}

export default TopBar;
