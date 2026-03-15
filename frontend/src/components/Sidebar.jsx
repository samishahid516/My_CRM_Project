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

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) toggleSidebar(); 
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🧠</div>
        <div>
          <h1>CRM Intel</h1>
          <span>AI Email Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Compose Button */}
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginBottom: '16px', padding: '10px', justifyContent: 'center' }}
          onClick={onCompose}
        >
          <HiOutlinePencilAlt /> Compose Email
        </button>

        <div className="sidebar-section-title">Main</div>
        
        <button className={`sidebar-link ${isActive('/') ? 'active' : ''}`} onClick={() => handleNavigate('/')}>
          <span className="sidebar-link-icon"><HiOutlineHome /></span>
          Dashboard
        </button>

        <button className={`sidebar-link ${isActive('/emails') ? 'active' : ''}`} onClick={() => handleNavigate('/emails')}>
          <span className="sidebar-link-icon"><HiOutlineInbox /></span>
          All Emails
          {unreadCount > 0 && <span className="sidebar-link-badge">{unreadCount}</span>}
        </button>

        <button className={`sidebar-link ${isActive('/analytics') ? 'active' : ''}`} onClick={() => handleNavigate('/analytics')}>
          <span className="sidebar-link-icon"><HiOutlineChartBar /></span>
          Analytics
        </button>

        <div className="sidebar-section-title">Priority</div>

        <button className={`sidebar-link ${location.pathname === '/emails/priority/high' ? 'active' : ''}`} onClick={() => handleNavigate('/emails/priority/high')}>
          <span className="sidebar-link-icon"><HiOutlineExclamation /></span>
          High Priority
          {highPriorityCount > 0 && <span className="sidebar-link-badge high">{highPriorityCount}</span>}
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/priority/medium' ? 'active' : ''}`} onClick={() => handleNavigate('/emails/priority/medium')}>
          <span className="sidebar-link-icon"><HiOutlineMinus /></span>
          Medium Priority
          {mediumPriorityCount > 0 && <span className="sidebar-link-badge medium">{mediumPriorityCount}</span>}
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/priority/low' ? 'active' : ''}`} onClick={() => handleNavigate('/emails/priority/low')}>
          <span className="sidebar-link-icon"><HiOutlineArrowDown /></span>
          Low Priority
          {lowPriorityCount > 0 && <span className="sidebar-link-badge low">{lowPriorityCount}</span>}
        </button>

        <div className="sidebar-section-title">Sentiment</div>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/angry' ? 'active' : ''}`} onClick={() => handleNavigate('/emails/sentiment/angry')}>
          <span className="sidebar-link-icon">😡</span>
          Angry
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/negative' ? 'active' : ''}`} onClick={() => handleNavigate('/emails/sentiment/negative')}>
          <span className="sidebar-link-icon"><HiOutlineEmojiSad /></span>
          Negative
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/neutral' ? 'active' : ''}`} onClick={() => handleNavigate('/emails/sentiment/neutral')}>
          <span className="sidebar-link-icon">😐</span>
          Neutral
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/positive' ? 'active' : ''}`} onClick={() => handleNavigate('/emails/sentiment/positive')}>
          <span className="sidebar-link-icon"><HiOutlineEmojiHappy /></span>
          Positive
        </button>

        <button className={`sidebar-link ${location.pathname === '/emails/sentiment/happy' ? 'active' : ''}`} onClick={() => handleNavigate('/emails/sentiment/happy')}>
          <span className="sidebar-link-icon">🥳</span>
          Happy
        </button>
      </nav>
    </aside>
    </>
  );
}

export default Sidebar;
