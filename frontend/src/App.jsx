import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import EmailList from './pages/EmailList';
import EmailDetailPage from './pages/EmailDetailPage';
import Analytics from './pages/Analytics';
import ComposeModal from './components/ComposeModal';
import { getAnalytics } from './services/api';

function App() {
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await getAnalytics();
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
        const highP = res.data.data.priorityDistribution?.find(p => p._id === 'high');
        setHighPriorityCount(highP?.count || 0);
      }
    } catch (err) {
      console.log('Could not fetch counts');
    }
  };

  return (
    <Router>
      <div className="app-layout">
        <Sidebar 
          unreadCount={unreadCount} 
          highPriorityCount={highPriorityCount}
          onCompose={() => setShowCompose(true)}
        />
        <div className="main-content">
          <TopBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            unreadCount={unreadCount}
          />
          <Routes>
            <Route path="/" element={<Dashboard onViewEmail={() => {}} />} />
            <Route path="/emails" element={<EmailList searchQuery={searchQuery} onRefresh={fetchCounts} />} />
            <Route path="/emails/:id" element={<EmailDetailPage onRefresh={fetchCounts} />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/emails/priority/:priority" element={<EmailList searchQuery={searchQuery} onRefresh={fetchCounts} />} />
            <Route path="/emails/sentiment/:sentiment" element={<EmailList searchQuery={searchQuery} onRefresh={fetchCounts} />} />
          </Routes>
        </div>

        {showCompose && (
          <ComposeModal 
            onClose={() => setShowCompose(false)} 
            onSent={fetchCounts}
          />
        )}

        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 3000,
            style: {
              background: '#1a1f35',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.06)',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
