const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  from: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  to: {
    name: { type: String, default: 'CRM Admin' },
    email: { type: String, default: 'admin@crm-intelligence.com' }
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['angry', 'happy', 'neutral', 'negative', 'positive'],
    default: 'neutral'
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  priorityScore: {
    type: Number,
    default: 50
  },
  category: {
    type: String,
    enum: ['complaint', 'inquiry', 'feedback', 'support', 'billing', 'partnership', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived', 'flagged'],
    default: 'unread'
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  autoReply: {
    suggested: { type: String, default: '' },
    format: { type: String, default: 'professional' }
  },
  tags: [{
    type: String
  }],
  attachments: [{
    name: String,
    size: Number,
    type: String
  }],
  readAt: {
    type: Date,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient sorting by priority and date
emailSchema.index({ priority: 1, createdAt: -1 });
emailSchema.index({ sentiment: 1 });
emailSchema.index({ status: 1 });
emailSchema.index({ category: 1 });

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
