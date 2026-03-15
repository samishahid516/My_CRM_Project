const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const he = require('he');
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
      console.log('🚀 [IMAP] High-Speed Sync Started...');
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');
      
      try {
        const messages = await client.search({ seen: false });
        console.log(`✉️ [IMAP] Found ${messages.length} pending emails. Processing in parallel...`);

        // Process in batches of 10 for maximum speed "in seconds"
        const BATCH_SIZE = 10;
        for (let i = 0; i < messages.length; i += BATCH_SIZE) {
          const batch = messages.slice(i, i + BATCH_SIZE);
          
          await Promise.all(batch.map(async (uid) => {
            try {
              const messageStream = await client.fetchOne(uid, { source: true });
              const parsed = await simpleParser(messageStream.source);

              const emailData = {
                from: {
                  name: he.decode(parsed.from?.value[0]?.name || parsed.from?.value[0]?.address?.split('@')[0] || 'Unknown'),
                  email: parsed.from?.value[0]?.address
                },
                subject: he.decode(parsed.subject || '(No Subject)'),
                body: he.decode(parsed.text || parsed.textAsHtml || '(No Content)').replace(/\r\n/g, '\n').trim(),
                status: 'unread'
              };

              // Check DB
              const exists = await Email.findOne({ 
                'from.email': emailData.from.email,
                subject: emailData.subject,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
              });

              if (!exists) {
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
                
                socketService.sendNotification('new-email', {
                  id: newEmail._id,
                  from: newEmail.from,
                  subject: newEmail.subject,
                  sentiment: newEmail.sentiment,
                  priority: newEmail.priority
                });
              }

              // Mark as seen immediately
              await client.messageFlagsAdd(uid, ['\\Seen']);
            } catch (err) {
              console.error(`❌ [IMAP] Batch Error (UID ${uid}):`, err.message);
            }
          }));
          
          console.log(`📉 [IMAP] Progress: ${Math.min(i + BATCH_SIZE, messages.length)}/${messages.length} processed.`);
        }
      } finally {
        lock.release();
      }

      await client.logout();
      console.log('✅ [IMAP] High-Speed Sync Complete.');
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
