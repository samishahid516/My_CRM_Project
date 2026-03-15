import React, { useState } from 'react';
import { HiOutlineX, HiOutlinePaperAirplane } from 'react-icons/hi';
import { createEmail } from '../services/api';
import toast from 'react-hot-toast';

function ComposeModal({ onClose, onSent }) {
  const [form, setForm] = useState({
    fromName: '',
    fromEmail: '',
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromName || !form.fromEmail || !form.subject || !form.body) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      const res = await createEmail({
        from: { name: form.fromName, email: form.fromEmail },
        subject: form.subject,
        body: form.body
      });

      if (res.data.success) {
        setAiResult(res.data.aiAnalysis);
        toast.success('Email received & AI analyzed!');
        onSent();
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>📨 Simulate Incoming Email</h3>
          <button className="modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Sender Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="John Doe"
                value={form.fromName}
                onChange={(e) => setForm({ ...form, fromName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sender Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="john@company.com"
                value={form.fromEmail}
                onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                type="text"
                placeholder="Email subject line..."
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Body</label>
              <textarea
                className="form-textarea"
                placeholder="Write the email content here... The AI will analyze sentiment, classify priority, and suggest an auto-reply."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>

            {aiResult && (
              <div style={{ 
                background: 'rgba(99, 102, 241, 0.08)', 
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '10px', 
                padding: '16px',
                marginTop: '8px'
              }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: '#818cf8' }}>
                  🤖 AI Analysis Results
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-sentiment badge-${aiResult.sentiment}`}>
                    {aiResult.sentiment}
                  </span>
                  <span className={`badge badge-priority badge-${aiResult.priority}`}>
                    {aiResult.priority} priority
                  </span>
                  <span className="badge badge-category">
                    {aiResult.category}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <HiOutlinePaperAirplane />
              {sending ? 'Analyzing...' : 'Send & Analyze'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComposeModal;
