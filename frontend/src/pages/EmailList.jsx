import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  HiOutlineStar, HiStar, HiOutlineTrash, HiOutlineRefresh,
  HiOutlineFilter, HiOutlineSortDescending
} from 'react-icons/hi';
import { getEmails, toggleStar, deleteEmail } from '../services/api';
import toast from 'react-hot-toast';

function EmailList({ searchQuery, onRefresh }) {
  const navigate = useNavigate();
  const { priority, sentiment } = useParams();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [sortBy, setSortBy] = useState('smart');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchEmails();
  }, [priority, sentiment, searchQuery, sortBy, statusFilter, categoryFilter, pagination.page]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 15,
        sortBy,
        search: searchQuery || undefined,
        priority: priority || undefined,
        sentiment: sentiment || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined
      };

      const res = await getEmails(params);
      if (res.data.success) {
        setEmails(res.data.data);
        setPagination(prev => ({ ...prev, ...res.data.pagination }));
      }
    } catch (err) {
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async (e, emailId) => {
    e.stopPropagation();
    try {
      await toggleStar(emailId);
      setEmails(prev => prev.map(em => 
        em._id === emailId ? { ...em, isStarred: !em.isStarred } : em
      ));
    } catch (err) {
      toast.error('Failed to update star');
    }
  };

  const handleDelete = async (e, emailId) => {
    e.stopPropagation();
    try {
      await deleteEmail(emailId);
      setEmails(prev => prev.filter(em => em._id !== emailId));
      toast.success('Email deleted');
      onRefresh();
    } catch (err) {
      toast.error('Failed to delete email');
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAvatarColor = (name) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getPageTitle = () => {
    if (priority) return `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Emails`;
    if (sentiment) return `${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Emails`;
    return 'All Emails';
  };

  const getPageDescription = () => {
    if (priority === 'high') return 'Emails requiring immediate attention and action';
    if (priority === 'medium') return 'Standard priority emails for regular processing';
    if (priority === 'low') return 'Low priority emails that can be addressed later';
    if (sentiment) return `Emails classified as ${sentiment} by AI sentiment analysis`;
    return 'All emails sorted by AI priority classification';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📬 {getPageTitle()}</h2>
        <p>{getPageDescription()}</p>
      </div>

      <div className="email-section">
        {/* Toolbar */}
        <div className="email-toolbar">
          <div className="email-toolbar-left">
            <HiOutlineFilter style={{ color: 'var(--text-muted)' }} />
            
            {['', 'unread', 'read', 'replied'].map(status => (
              <button 
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => { setStatusFilter(status); setPagination(prev => ({ ...prev, page: 1 })); }}
              >
                {status || 'All Status'}
              </button>
            ))}
          </div>

          <div className="email-toolbar-right">
            <HiOutlineSortDescending style={{ color: 'var(--text-muted)' }} />
            <select 
              className="sort-select" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="smart">🤖 Smart Sort (AI)</option>
              <option value="date">📅 Date (Newest)</option>
              <option value="sentiment">🎭 Sentiment</option>
            </select>

            <button className="btn-icon" onClick={fetchEmails} title="Refresh">
              <HiOutlineRefresh />
            </button>
          </div>
        </div>

        {/* Email List */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span className="loading-text">Loading emails...</span>
          </div>
        ) : emails.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No emails found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            {emails.map(email => (
              <div 
                key={email._id} 
                className={`email-item ${email.status === 'unread' ? 'unread' : ''}`}
                onClick={() => navigate(`/emails/${email._id}`)}
              >
                <div className={`email-priority-indicator ${email.priority}`}></div>
                
                <button 
                  className={`email-star ${email.isStarred ? 'starred' : ''}`}
                  onClick={(e) => handleStar(e, email._id)}
                >
                  {email.isStarred ? <HiStar /> : <HiOutlineStar />}
                </button>

                <div className="email-avatar" style={{ background: getAvatarColor(email.from?.name || '') }}>
                  {email.from?.name?.charAt(0) || '?'}
                </div>

                <div className="email-content">
                  <div className="email-header-row">
                    <span className="email-sender">{email.from?.name}</span>
                    <span className="email-time">{formatTime(email.createdAt)}</span>
                  </div>
                  <div className="email-subject">{email.subject}</div>
                  <div className="email-preview">{email.body?.substring(0, 100)}...</div>
                </div>

                <div className="email-meta">
                  <span className={`badge badge-sentiment badge-${email.sentiment}`}>{email.sentiment}</span>
                  <span className={`badge badge-priority badge-${email.priority}`}>{email.priority}</span>
                  <span className="badge badge-category">{email.category}</span>
                  <button 
                    className="btn-icon"
                    onClick={(e) => handleDelete(e, email._id)}
                    title="Delete"
                    style={{ marginLeft: '4px' }}
                  >
                    <HiOutlineTrash style={{ fontSize: '0.85rem' }} />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="pagination">
              <button 
                className="pagination-btn" 
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ←
              </button>
              
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pagination-btn ${pagination.page === p ? 'active' : ''}`}
                  onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                >
                  {p}
                </button>
              ))}
              
              <span className="pagination-info">
                {pagination.total} emails total
              </span>

              <button 
                className="pagination-btn" 
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EmailList;
