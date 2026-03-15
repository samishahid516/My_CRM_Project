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
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

function App() {
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);
  const [mediumPriorityCount, setMediumPriorityCount] = useState(0);
  const [lowPriorityCount, setLowPriorityCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    fetchCounts();

    // Initialize Socket Connection
    const socket = io('http://localhost:5000', {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to Notification Server');
    });

    socket.on('new-email', (data) => {
      console.log('✉️ New Email via Socket:', data);
      fetchCounts(); // Refresh badges

      // Add to notifications list
      setNotifications(prev => [
        {
          id: data.id,
          from: data.from.name,
          subject: data.subject,
          priority: data.priority,
          sentiment: data.sentiment,
          time: new Date()
        },
        ...prev
      ].slice(0, 5)); // Keep last 5
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await getAnalytics();
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
        
        const priorityDist = res.data.data.priorityDistribution || [];
        const highP = priorityDist.find(p => p._id === 'high');
        const mediumP = priorityDist.find(p => p._id === 'medium');
        const lowP = priorityDist.find(p => p._id === 'low');
        
        setHighPriorityCount(highP?.count || 0);
        setMediumPriorityCount(mediumP?.count || 0);
        setLowPriorityCount(lowP?.count || 0);
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
          mediumPriorityCount={mediumPriorityCount}
          lowPriorityCount={lowPriorityCount}
          onCompose={() => setShowCompose(true)}
        />
        <div className="main-content">
          <TopBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            unreadCount={unreadCount}
            notifications={notifications}
            setNotifications={setNotifications}
            theme={theme}
            toggleTheme={toggleTheme}
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
