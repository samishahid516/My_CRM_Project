const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const Email = require('../models/Email');
const AIService = require('./aiService');
const socketService = require('./socket');
require('dotenv').config();

// ═══════════════════════════════════════════════════════════════
// IMAP SERVICE - Fetch and Analyze Inbound Emails
// ═══════════════════════════════════════════════════════════════

class IMAPService {
  constructor() {
    this.client = new ImapFlow({
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT) || 993,
      secure: true,
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASS
      },
      logger: false
    });
    this.isPolling = false;
  }

  async fetchNewEmails() {
    if (this.isPollingActive) return;
    this.isPollingActive = true;

    // Create a NEW instance for every connection attempt to avoid "Can not re-use ImapFlow instance"
    const client = new ImapFlow({
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT) || 993,
      secure: true,
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASS
      },
      logger: false
    });

    try {
      console.log('🔍 [IMAP] Checking for new emails...');
      await client.connect();

      const lock = await client.getMailboxLock('INBOX');
      
      try {
        const messages = await client.search({ seen: false });
        console.log(`✉️ [IMAP] Found ${messages.length} unread emails.`);

        for (const uid of messages) {
          try {
            console.log(`📦 [IMAP] Fetching email UID: ${uid}`);
            const messageStream = await client.fetchOne(uid, { source: true });
            const parsed = await simpleParser(messageStream.source);

            const emailData = {
              from: {
                name: parsed.from?.value[0]?.name || parsed.from?.value[0]?.address?.split('@')[0] || 'Unknown',
                email: parsed.from?.value[0]?.address
              },
              subject: parsed.subject || '(No Subject)',
              body: parsed.text || parsed.textAsHtml || '(No Content)',
              status: 'unread'
            };

            const exists = await Email.findOne({ 
              'from.email': emailData.from.email,
              subject: emailData.subject,
              createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            if (!exists) {
              console.log(`🤖 [IMAP] AI Analyzing new email: ${emailData.subject}`);
              const analysis = AIService.analyzeEmail(emailData);

              const newEmail = new Email({
                ...emailData,
                sentiment: analysis.sentiment,
                sentimentScore: analysis.sentimentScore,
                priority: analysis.priority,
                priorityScore: analysis.priorityScore,
                category: analysis.category,
                autoReply: analysis.autoReply,
                tags: analysis.tags
              });

              await newEmail.save();
              console.log(`✅ [IMAP] Saved to DB: ${emailData.subject}`);

              socketService.sendNotification('new-email', {
                id: newEmail._id,
                from: newEmail.from,
                subject: newEmail.subject,
                sentiment: newEmail.sentiment,
                priority: newEmail.priority
              });
            } else {
              console.log(`⏭️ [IMAP] Skipping duplicate: ${emailData.subject}`);
            }

            await client.messageFlagsAdd(uid, ['\\Seen']);
            
          } catch (itemError) {
            console.error(`❌ [IMAP] Item Error (UID ${uid}):`, itemError.message);
          }
        }
      } finally {
        lock.release();
      }

      await client.logout();
    } catch (error) {
      console.error('❌ [IMAP] Connection Error:', error.message);
    } finally {
      this.isPollingActive = false;
    }
  }

  startPolling() {
    this.isPollingActive = false;
    const interval = parseInt(process.env.IMAP_POLL_INTERVAL) || 60000;
    console.log(`🚀 [IMAP] Poller Started (Interval: ${interval}ms)`);
    
    this.fetchNewEmails();
    setInterval(() => this.fetchNewEmails(), interval);
  }
}

module.exports = new IMAPService();
