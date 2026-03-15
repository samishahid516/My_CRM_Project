const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const Email = require('../models/Email');
const AIService = require('./aiService');
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
    try {
      console.log('🔍 Checking for new emails...');
      await this.client.connect();

      // Select and lock the Inbox to prevent concurrent modifications
      let lock = await this.client.getMailboxLock('INBOX');
      
      try {
        // Search for unread emails
        const messages = await this.client.search({ seen: false });
        
        console.log(`✉️ Found ${messages.length} unread emails.`);

        for (const uid of messages) {
          try {
            // Fetch the individual message stream
            let messageStream = await this.client.fetchOne(uid, { source: true });
            let parsed = await simpleParser(messageStream.source);

            const emailData = {
              from: {
                name: parsed.from.value[0].name || parsed.from.value[0].address.split('@')[0],
                email: parsed.from.value[0].address
              },
              subject: parsed.subject || '(No Subject)',
              body: parsed.text || parsed.textAsHtml || '(No Content)',
              status: 'unread'
            };

            // Check if email already exists in DB to prevent duplicates
            const exists = await Email.findOne({ 
              'from.email': emailData.from.email,
              subject: emailData.subject,
              createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Check last 24h
            });

            if (!exists) {
              console.log(`🤖 Analyzing email from: ${emailData.from.email}`);
              
              // Run AI analysis
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
              console.log(`✅ Saved & Analyzed: ${emailData.subject}`);
            }

            // Mark as seen on the server
            await this.client.messageFlagsAdd(uid, ['\\Seen']);
            
          } catch (itemError) {
            console.error(`❌ Error processing email UID ${uid}:`, itemError.message);
          }
        }
      } finally {
        // Release the lock
        lock.release();
      }

      await this.client.logout();
    } catch (error) {
      console.error('❌ IMAP Error:', error.message);
      // Ensure we logout even on error
      try { await this.client.logout(); } catch(e) {}
    }
  }

  startPolling() {
    if (this.isPolling) return;
    this.isPolling = true;
    
    const interval = parseInt(process.env.IMAP_POLL_INTERVAL) || 60000;
    console.log(`🚀 Starting IMAP Poller (Interval: ${interval}ms)`);
    
    // Immediate first run
    this.fetchNewEmails();

    setInterval(() => {
      this.fetchNewEmails();
    }, interval);
  }
}

module.exports = new IMAPService();
