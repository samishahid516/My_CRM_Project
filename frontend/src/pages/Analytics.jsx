import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../services/api';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

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

const CHART_TOOLTIP_STYLE = { 
  background: '#1a1f35', 
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '12px'
};

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalytics();
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span className="loading-text">Loading analytics...</span>
        </div>
      </div>
    );
  }

  const sentimentData = analytics?.sentimentDistribution?.map(s => ({
    name: s._id?.charAt(0).toUpperCase() + s._id?.slice(1),
    value: s.count,
    avgScore: Math.round((s.avgScore || 0) * 100) / 100,
    color: SENTIMENT_COLORS[s._id] || '#6b7280'
  })) || [];

  const priorityData = analytics?.priorityDistribution?.map(p => ({
    name: p._id?.charAt(0).toUpperCase() + p._id?.slice(1),
    value: p.count,
    avgScore: Math.round(p.avgScore || 0),
    color: PRIORITY_COLORS[p._id] || '#6b7280'
  })) || [];

  const categoryData = analytics?.categoryDistribution?.map(c => ({
    name: c._id?.charAt(0).toUpperCase() + c._id?.slice(1),
    count: c.count
  })) || [];

  const statusData = analytics?.statusDistribution?.map(s => ({
    name: s._id?.charAt(0).toUpperCase() + s._id?.slice(1),
    count: s.count
  })) || [];

  // Radar data for category analysis
  const radarData = categoryData.map(c => ({
    category: c.name,
    count: c.count,
    fullMark: Math.max(...categoryData.map(d => d.count)) + 2
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📈 Analytics Dashboard</h2>
        <p>AI-powered email intelligence metrics and insights</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card animate-in">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">📧</div>
            <span className="stat-card-label">Total Emails</span>
          </div>
          <div className="stat-card-value">{analytics?.totalEmails || 0}</div>
          <span className="stat-card-change positive">All AI analyzed</span>
        </div>

        <div className="stat-card animate-in" style={{ animationDelay: '100ms' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon red">🔔</div>
            <span className="stat-card-label">Unread</span>
          </div>
          <div className="stat-card-value">{analytics?.unreadCount || 0}</div>
          <span className="stat-card-change">Pending review</span>
        </div>

        <div className="stat-card animate-in" style={{ animationDelay: '200ms' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon green">📊</div>
            <span className="stat-card-label">Response Rate</span>
          </div>
          <div className="stat-card-value">{analytics?.responseRate || 0}%</div>
          <span className="stat-card-change positive">Auto-reply available</span>
        </div>

        <div className="stat-card animate-in" style={{ animationDelay: '300ms' }}>
          <div className="stat-card-header">
            <div className="stat-card-icon amber">🎯</div>
            <span className="stat-card-label">Sentiments</span>
          </div>
          <div className="stat-card-value">{sentimentData.length}</div>
          <span className="stat-card-change">Categories detected</span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        <div className="chart-card animate-in" style={{ animationDelay: '400ms' }}>
          <h3><span>🎭</span> Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card animate-in" style={{ animationDelay: '500ms' }}>
          <h3><span>🎯</span> Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        <div className="chart-card animate-in" style={{ animationDelay: '600ms' }}>
          <h3><span>📂</span> Category Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="url(#areaGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card animate-in" style={{ animationDelay: '700ms' }}>
          <h3><span>📋</span> Email Status Overview</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="url(#statusGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <div className="chart-card animate-in" style={{ animationDelay: '800ms', marginBottom: 'var(--space-6)' }}>
          <h3><span>🕸️</span> Category Radar Analysis</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar
                name="Emails"
                dataKey="count"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sentiment Insights Table */}
      <div className="chart-card animate-in" style={{ animationDelay: '900ms' }}>
        <h3><span>🧠</span> AI Sentiment Insights</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            marginTop: '12px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sentiment</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Count</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Score</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Percentage</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {sentimentData.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge badge-sentiment badge-${item.name.toLowerCase()}`}>
                      {item.name}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px', fontWeight: 600 }}>{item.value}</td>
                  <td style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>{item.avgScore}</td>
                  <td style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>
                    {analytics?.totalEmails ? Math.round((item.value / analytics.totalEmails) * 100) : 0}%
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ 
                      height: '8px', 
                      borderRadius: '4px', 
                      background: 'rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: '200px'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${analytics?.totalEmails ? (item.value / analytics.totalEmails) * 100 : 0}%`,
                        background: item.color,
                        borderRadius: '4px',
                        transition: 'width 1s ease'
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;