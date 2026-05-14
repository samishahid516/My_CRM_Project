import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HiOutlineHome, HiOutlineInbox, HiOutlineChartBar, 
  HiOutlineStar, HiOutlineArchive, HiOutlinePencilAlt,
  HiOutlineExclamation, HiOutlineArrowDown, HiOutlineMinus,
  HiOutlineEmojiHappy, HiOutlineEmojiSad
} from 'react-icons/hi';

function Sidebar({ unreadCount, highPriorityCount, mediumPriorityCount, lowPriorityCount, onCompose, isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    if (window.innerWidth <= 1024) {
      toggleSidebar();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🧠</div>
        <div>
          <h1>CRM AI <span>Intelligence</span></h1>
        </div>
      </div>

      <div className="sidebar-compose">
        <button className="compose-btn" onClick={onCompose}>
          <HiOutlinePencilAlt /> Compose
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Main</div>
        
        <button className={`sidebar-link ${isActive('/') ? 'active' : ''}`} onClick={() => handleNav('/')}>
          <span className="sidebar-link-icon"><HiOutlineHome /></span>
          Dashboard
        </button>

        <button className={`sidebar-link ${isActive('/emails') ? 'active' : ''}`} onClick={() => handleNav('/emails')}>
          <span className="sidebar-link-icon"><HiOutlineInbox /></span>
          All Emails
          {unreadCount > 0 && <span className="sidebar-link-badge">{unreadCount}</span>}
        </button>

        <button className={`sidebar-link ${isActive('/analytics') ? 'active' : ''}`} onClick={() => handleNav('/analytics')}>
          <span className="sidebar-link-icon"><HiOutlineChartBar /></span>
          Analytics
        </button>

        <div className="sidebar-section-title">Priority</div>

        <button className={`sidebar-link ${location.pathname === '/emails/priority/high' ? 'active' : ''}`} onClick={() => handleNav('/emails/priority/high')}>
          <span className="sidebar-link-icon"><HiOutlineExclamation /></span>
          High Priority
          {highPriorityCount > 0 && <span className="sidebar-link-badge high">{highPriorityCount}</span>}
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/priority/medium' ? 'active' : ''}`} onClick={() => handleNav('/emails/priority/medium')}>
          <span className="sidebar-link-icon"><HiOutlineMinus /></span>
          Medium Priority
          {mediumPriorityCount > 0 && <span className="sidebar-link-badge medium">{mediumPriorityCount}</span>}
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/priority/low' ? 'active' : ''}`} onClick={() => handleNav('/emails/priority/low')}>
          <span className="sidebar-link-icon"><HiOutlineArrowDown /></span>
          Low Priority
          {lowPriorityCount > 0 && <span className="sidebar-link-badge low">{lowPriorityCount}</span>}
        </button>

        <div className="sidebar-section-title">Sentiment</div>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/angry' ? 'active' : ''}`} onClick={() => handleNav('/emails/sentiment/angry')}>
          <span className="sidebar-link-icon">😡</span>
          Angry
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/negative' ? 'active' : ''}`} onClick={() => handleNav('/emails/sentiment/negative')}>
          <span className="sidebar-link-icon"><HiOutlineEmojiSad /></span>
          Negative
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/neutral' ? 'active' : ''}`} onClick={() => handleNav('/emails/sentiment/neutral')}>
          <span className="sidebar-link-icon">😐</span>
          Neutral
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/positive' ? 'active' : ''}`} onClick={() => handleNav('/emails/sentiment/positive')}>
          <span className="sidebar-link-icon"><HiOutlineEmojiHappy /></span>
          Positive
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/happy' ? 'active' : ''}`} onClick={() => handleNav('/emails/sentiment/happy')}>
          <span className="sidebar-link-icon">🥳</span>
          Happy
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
