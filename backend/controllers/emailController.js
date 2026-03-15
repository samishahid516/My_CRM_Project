const Email = require('../models/Email');
const AIService = require('../services/aiService');
const mailService = require('../services/mailService');

// ═══════════════════════════════════════════════════════════════
// EMAIL CONTROLLER - REST API Handlers
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/emails
 * Get all emails with smart sorting (high priority first)
 */
exports.getEmails = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sentiment,
      priority,
      category,
      status,
      search,
      sortBy = 'smart'
    } = req.query;

    // Build filter
    const filter = {};
    if (sentiment) filter.sentiment = sentiment;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { 'from.name': { $regex: search, $options: 'i' } },
        { 'from.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Smart sorting: high priority → medium → low, then by date
    let sort;
    if (sortBy === 'smart') {
      sort = { createdAt: -1, priorityScore: -1 };
    } else if (sortBy === 'date') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'sentiment') {
      sort = { sentimentScore: 1, createdAt: -1 };
    } else {
      sort = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [emails, total] = await Promise.all([
      Email.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Email.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/emails/:id
 * Get single email by ID
 */
exports.getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    // Mark as read
    if (email.status === 'unread') {
      email.status = 'read';
      email.readAt = new Date();
      await email.save();
    }

    res.json({ success: true, data: email });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/emails
 * Create new email and run AI analysis
 */
exports.createEmail = async (req, res) => {
  try {
    const { from, to, subject, body } = req.body;

    // Run AI analysis
    const analysis = AIService.analyzeEmail({ from, subject, body });

    const email = new Email({
      from,
      to,
      subject,
      body,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      priority: analysis.priority,
      priorityScore: analysis.priorityScore,
      category: analysis.category,
      autoReply: analysis.autoReply,
      tags: analysis.tags
    });

    await email.save();

    res.status(201).json({
      success: true,
      data: email,
      aiAnalysis: analysis
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/emails/:id
 * Update email status/properties
 */
exports.updateEmail = async (req, res) => {
  try {
    const email = await Email.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }
    res.json({ success: true, data: email });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/emails/:id
 * Delete an email
 */
exports.deleteEmail = async (req, res) => {
  try {
    const email = await Email.findByIdAndDelete(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }
    res.json({ success: true, message: 'Email deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/emails/:id/reply
 * Mark email as replied and optionally send real email via Nodemailer
 */
exports.replyToEmail = async (req, res) => {
  try {
    const { replyText, subject } = req.body;
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    // If replyText is provided, send a real email
    if (replyText) {
      const emailSubject = subject || `Re: ${email.subject}`;
      await mailService.sendEmail(
        email.from.email,
        emailSubject,
        replyText
      );
    }

    email.status = 'replied';
    email.repliedAt = new Date();
    await email.save();

    res.json({ 
      success: true, 
      data: email, 
      message: replyText ? 'Real email sent successfully' : 'Marked as replied' 
    });
  } catch (error) {
    console.error('Reply Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/emails/:id/analyze
 * Re-run AI analysis on an email
 */
exports.analyzeEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    const analysis = AIService.analyzeEmail({
      from: email.from,
      subject: email.subject,
      body: email.body
    });

    email.sentiment = analysis.sentiment;
    email.sentimentScore = analysis.sentimentScore;
    email.priority = analysis.priority;
    email.priorityScore = analysis.priorityScore;
    email.category = analysis.category;
    email.autoReply = analysis.autoReply;
    email.tags = analysis.tags;
    await email.save();

    res.json({ success: true, data: email, aiAnalysis: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/emails/:id/star
 * Toggle star on email
 */
exports.toggleStar = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    email.isStarred = !email.isStarred;
    await email.save();

    res.json({ success: true, data: email });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics
 * Get dashboard analytics data
 */
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalEmails,
      sentimentStats,
      priorityStats,
      categoryStats,
      statusStats,
      recentHighPriority
    ] = await Promise.all([
      Email.countDocuments(),
      Email.aggregate([
        { $group: { _id: '$sentiment', count: { $sum: 1 }, avgScore: { $avg: '$sentimentScore' } } }
      ]),
      Email.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 }, avgScore: { $avg: '$priorityScore' } } }
      ]),
      Email.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Email.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Email.find({ priority: 'high' }).sort({ createdAt: -1 }).limit(5).select('from subject sentiment createdAt')
    ]);

    // Calculate response rate
    const repliedCount = statusStats.find(s => s._id === 'replied')?.count || 0;
    const responseRate = totalEmails > 0 ? Math.round((repliedCount / totalEmails) * 100) : 0;

    // Unread count
    const unreadCount = statusStats.find(s => s._id === 'unread')?.count || 0;

    res.json({
      success: true,
      data: {
        totalEmails,
        unreadCount,
        responseRate,
        sentimentDistribution: sentimentStats,
        priorityDistribution: priorityStats,
        categoryDistribution: categoryStats,
        statusDistribution: statusStats,
        recentHighPriority
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
