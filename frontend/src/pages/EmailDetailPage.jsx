import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, HiOutlineReply, HiOutlineTrash,
  HiOutlineStar, HiStar, HiOutlineRefresh, HiOutlineClipboardCopy
} from 'react-icons/hi';
import { getEmailById, toggleStar, deleteEmail, replyToEmail, analyzeEmail } from '../services/api';
import toast from 'react-hot-toast';

function EmailDetailPage({ onRefresh }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchEmail();
  }, [id]);

  const fetchEmail = async () => {
    setLoading(true);
    try {
      const res = await getEmailById(id);
      if (res.data.success) {
        setEmail(res.data.data);
        setReplyText(res.data.data.autoReply?.suggested || '');
      }
    } catch (err) {
      toast.error('Failed to load email');
      navigate('/emails');
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async () => {
    try {
      const res = await toggleStar(id);
      if (res.data.success) {
        setEmail(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to update star');
    }
  };

  const handleReply = async (sendReal = false) => {
    if (sendReal && !replyText) {
      toast.error('Reply text cannot be empty');
      return;
    }

    setSendingEmail(sendReal);
    try {
      const res = await replyToEmail(id, sendReal ? { replyText } : {});
      if (res.data.success) {
        setEmail(res.data.data);
        toast.success(sendReal ? 'Real email sent successfully!' : 'Marked as replied!');
        onRefresh();
      }
    } catch (err) {
      toast.error(sendReal ? 'Failed to send real email. Check backend logs & .env' : 'Failed to mark as replied');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      const res = await analyzeEmail(id);
      if (res.data.success) {
        setEmail(res.data.data);
        toast.success('AI re-analyzed successfully!');
      }
    } catch (err) {
      toast.error('Failed to re-analyze');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEmail(id);
      toast.success('Email deleted');
      onRefresh();
      navigate('/emails');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const copyAutoReply = () => {
    if (email?.autoReply?.suggested) {
      navigator.clipboard.writeText(email.autoReply.suggested);
      toast.success('Auto-reply copied to clipboard!');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarColor = (name) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getSentimentEmoji = (sentiment) => {
    const emojis = { angry: '😡', negative: '😟', neutral: '😐', positive: '😊', happy: '🥳' };
    return emojis[sentiment] || '😐';
  };

  const getPriorityIcon = (priority) => {
    const icons = { high: '🔴', medium: '🟡', low: '🟢' };
    return icons[priority] || '⚪';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span className="loading-text">Loading email...</span>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>Email not found</h3>
          <button className="btn btn-primary" onClick={() => navigate('/emails')}>
            Back to Emails
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="detail-layout">
        {/* Main Email Content */}
        <div>
          <div className="email-detail animate-in">
            <div className="email-detail-header">
              <button className="email-detail-back" onClick={() => navigate('/emails')}>
                <HiOutlineArrowLeft /> Back to Emails
              </button>

              <div className="email-detail-subject">{email.subject}</div>

              <div className="email-detail-meta">
                <div className="email-detail-sender">
                  <div 
                    className="email-detail-sender-avatar" 
                    style={{ background: getAvatarColor(email.from?.name) }}
                  >
                    {email.from?.name?.charAt(0) || '?'}
                  </div>
                  <div className="email-detail-sender-info">
                    <h4>{email.from?.name}</h4>
                    <span>{email.from?.email} • {formatDate(email.createdAt)}</span>
                  </div>
                </div>

                <div className="email-detail-badges">
                  <span className={`badge badge-sentiment badge-${email.sentiment}`}>
                    {getSentimentEmoji(email.sentiment)} {email.sentiment}
                  </span>
                  <span className={`badge badge-priority badge-${email.priority}`}>
                    {getPriorityIcon(email.priority)} {email.priority}
                  </span>
                  <span className="badge badge-category">{email.category}</span>
                  <span className="badge" style={{ 
                    background: email.status === 'replied' ? 'rgba(16,185,129,0.12)' : 
                                email.status === 'unread' ? 'rgba(99,102,241,0.12)' : 'rgba(107,114,128,0.12)',
                    color: email.status === 'replied' ? '#10b981' : 
                           email.status === 'unread' ? '#818cf8' : '#6b7280'
                  }}>
                    {email.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={handleReply}>
                  <HiOutlineReply /> {email.status === 'replied' ? 'Replied ✓' : 'Mark as Replied'}
                </button>
                <button className="btn btn-secondary" onClick={handleStar}>
                  {email.isStarred ? <HiStar style={{ color: '#f59e0b' }} /> : <HiOutlineStar />}
                  {email.isStarred ? 'Starred' : 'Star'}
                </button>
                <button className="btn btn-secondary" onClick={handleReanalyze}>
                  <HiOutlineRefresh /> Re-Analyze
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  <HiOutlineTrash /> Delete
                </button>
              </div>
            </div>

            <div className="email-detail-body">
              {email.body}
            </div>

            {/* Tags */}
            {email.tags?.length > 0 && (
              <div style={{ padding: '0 24px 24px' }}>
                <div className="tags-container">
                  {email.tags.map((tag, i) => (
                    <span key={i} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis Sidebar */}
        <div>
          <div className="ai-panel animate-in" style={{ animationDelay: '200ms' }}>
            <div className="ai-panel-header">
              <span className="ai-panel-icon">🤖</span>
              <h3>AI Analysis</h3>
            </div>
            <div className="ai-panel-content">
              <div className="ai-analysis-grid">
                <div className="ai-analysis-item">
                  <div className="ai-analysis-item-label">Sentiment</div>
                  <div className="ai-analysis-item-value" style={{ 
                    color: email.sentiment === 'angry' ? '#ef4444' :
                           email.sentiment === 'negative' ? '#f97316' :
                           email.sentiment === 'neutral' ? '#6b7280' :
                           email.sentiment === 'positive' ? '#10b981' : '#06b6d4'
                  }}>
                    {getSentimentEmoji(email.sentiment)}
                    <br />
                    {email.sentiment}
                  </div>
                </div>
                <div className="ai-analysis-item">
                  <div className="ai-analysis-item-label">Priority</div>
                  <div className="ai-analysis-item-value" style={{
                    color: email.priority === 'high' ? '#ef4444' :
                           email.priority === 'medium' ? '#f59e0b' : '#10b981'
                  }}>
                    {getPriorityIcon(email.priority)}
                    <br />
                    {email.priority}
                  </div>
                </div>
                <div className="ai-analysis-item">
                  <div className="ai-analysis-item-label">Score</div>
                  <div className="ai-analysis-item-value" style={{ color: '#818cf8' }}>
                    {email.sentimentScore}
                    <br />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      P: {email.priorityScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Auto Reply */}
              {email.autoReply?.suggested && (
                <div className="ai-autoreply">
                  <div className="ai-autoreply-header">
                    <h4>💬 Suggested Auto-Reply</h4>
                    <span className="ai-format-badge">
                      {email.autoReply?.format || 'professional'}
                    </span>
                  </div>
                  <div className="ai-autoreply-text">
                    {email.autoReply.suggested}
                  </div>
                  <div className="ai-autoreply-actions">
                    <button className="btn btn-primary" onClick={copyAutoReply}>
                      <HiOutlineClipboardCopy /> Copy
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleReply(true)}
                      disabled={sendingEmail}
                    >
                      <HiOutlineReply /> 
                      {sendingEmail ? 'Sending...' : 'Send Real Email'}
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '16px' }}>
                    <textarea
                      className="form-textarea"
                      style={{ minHeight: '120px', fontSize: '0.8rem' }}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Edit your reply here..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailDetailPage;
