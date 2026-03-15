import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineMail, HiOutlineExclamation, HiOutlineReply, 
  HiOutlineEye, HiOutlineLightningBolt, HiOutlineChartBar
} from 'react-icons/hi';
import { getAnalytics, getEmails } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SENTIMENT_COLORS = {
  angry: '#ef4444',
  negative: '#f97316',
  neutral: '#6b7280',
  positive: '#10b981',
  happy: '#06b6d4'
};

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981'
};

function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentEmails, setRecentEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, emailsRes] = await Promise.all([
        getAnalytics(),
        getEmails({ limit: 5, sortBy: 'smart' })
      ]);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (emailsRes.data.success) setRecentEmails(emailsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
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
    return `${diffDays}d ago`;
  };

  const getAvatarColor = (name) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span className="loading-text">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const sentimentData = analytics?.sentimentDistribution?.map(s => ({
    name: s._id?.charAt(0).toUpperCase() + s._id?.slice(1),
    value: s.count,
    color: SENTIMENT_COLORS[s._id] || '#6b7280'
  })) || [];

  const priorityData = analytics?.priorityDistribution?.map(p => ({
    name: p._id?.charAt(0).toUpperCase() + p._id?.slice(1),
    value: p.count,
    color: PRIORITY_COLORS[p._id] || '#6b7280'
  })) || [];

  const categoryData = analytics?.categoryDistribution?.map(c => ({
    name: c._id?.charAt(0).toUpperCase() + c._id?.slice(1),
    count: c.count
  })) || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <p>AI-powered email intelligence overview</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card animate-in">
          <div className="stat-card-header">
            <div className="stat-card-icon purple"><HiOutlineMail /></div>
            <span className="stat-card-label">Total Emails</span>
          </div>
          <div className="stat-card-value">{analytics?.totalEmails || 0}</div>
          <span className="stat-card-change positive">AI Analyzed</span>
        </div>

        <div className="stat-card animate-in" style={{ animationDelay: '100ms' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon red"><HiOutlineExclamation /></div>
            <span className="stat-card-label">Unread</span>
          </div>
          <div className="stat-card-value">{analytics?.unreadCount || 0}</div>
          <span className="stat-card-change">Needs attention</span>
        </div>

        <div className="stat-card animate-in" style={{ animationDelay: '200ms' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon green"><HiOutlineReply /></div>
            <span className="stat-card-label">Response Rate</span>
          </div>
          <div className="stat-card-value">{analytics?.responseRate || 0}%</div>
          <span className="stat-card-change positive">Auto-reply ready</span>
        </div>

        <div className="stat-card animate-in" style={{ animationDelay: '300ms' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon amber"><HiOutlineLightningBolt /></div>
            <span className="stat-card-label">AI Accuracy</span>
          </div>
          <div className="stat-card-value">96%</div>
          <span className="stat-card-change positive">Sentiment analysis</span>
        </div>
      </div>

      {/* High Priority Section */}
      {analytics?.recentHighPriority?.length > 0 && (
        <div className="high-priority-section animate-in" style={{ animationDelay: '400ms' }}>
          <h3>
            <HiOutlineExclamation /> High Priority Emails - Immediate Action Required
          </h3>
          {analytics.recentHighPriority.map((email, i) => (
            <div key={email._id} className="high-priority-item" onClick={() => navigate(`/emails/${email._id}`)}>
              <span className={`badge badge-sentiment badge-${email.sentiment}`}>{email.sentiment}</span>
              <span className="sender">{email.from?.name}</span>
              <span className="subject">{email.subject}</span>
              <span className="time">{formatTime(email.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card animate-in" style={{ animationDelay: '500ms' }}>
          <h3><span>🎭</span> Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1f35', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card animate-in" style={{ animationDelay: '600ms' }}>
          <h3><span>📊</span> Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1f35', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="count" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Smart-Sorted Emails */}
      <div className="email-section animate-in" style={{ animationDelay: '700ms' }}>
        <div className="email-toolbar">
          <div className="email-toolbar-left">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              <HiOutlineEye style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Recent Emails (Smart Sorted)
            </h3>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/emails')}>
            View All →
          </button>
        </div>
        
        {recentEmails.map(email => (
          <div 
            key={email._id} 
            className={`email-item ${email.status === 'unread' ? 'unread' : ''}`}
            onClick={() => navigate(`/emails/${email._id}`)}
          >
            <div className={`email-priority-indicator ${email.priority}`}></div>
            <div className="email-avatar" style={{ background: getAvatarColor(email.from?.name || '') }}>
              {email.from?.name?.charAt(0) || '?'}
            </div>
            <div className="email-content">
              <div className="email-header-row">
                <span className="email-sender">{email.from?.name}</span>
                <span className="email-time">{formatTime(email.createdAt)}</span>
              </div>
              <div className="email-subject">{email.subject}</div>
              <div className="email-preview">{email.body?.substring(0, 80)}...</div>
            </div>
            <div className="email-meta">
              <span className={`badge badge-sentiment badge-${email.sentiment}`}>{email.sentiment}</span>
              <span className={`badge badge-priority badge-${email.priority}`}>{email.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
