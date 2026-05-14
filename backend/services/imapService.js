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
      logger: false,
      connectionTimeout: 30000
    });

    try {
      console.log('⚡ [IMAP] Starting High-Speed Parallel Sync...');
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        const allUids = await client.search({ seen: false });
        // Take the latest 100 to process "in seconds" and prevent session hang
        const uids = allUids.slice(-100);
        console.log(`🔥 [IMAP] Found ${allUids.length} pending. Picking latest 100 for this cycle.`);

        const CHUNK_SIZE = 10;
        for (let i = 0; i < uids.length; i += CHUNK_SIZE) {
          const chunk = uids.slice(i, i + CHUNK_SIZE);

          await Promise.all(chunk.map(async (uid) => {
            try {
              const msg = await client.fetchOne(uid, { source: true });
              if (!msg || !msg.source) return;

              const parsed = await simpleParser(msg.source);
              const subject = he.decode(parsed.subject || '(No Subject)');
              const fromEmail = parsed.from?.value[0]?.address;

              const exists = await Email.exists({
                'from.email': fromEmail,
                subject: subject,
                createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
              });

              if (!exists) {
                const emailData = {
                  from: {
                    name: he.decode(parsed.from?.value[0]?.name || fromEmail?.split('@')[0] || 'Unknown'),
                    email: fromEmail
                  },
                  subject,
                  body: he.decode(parsed.text || parsed.textAsHtml || '(No Content)').replace(/\r\n/g, '\n').trim(),
                  status: 'unread'
                };

                const analysis = AIService.analyzeEmail(emailData);
                const newEmail = new Email({ ...emailData, ...analysis });
                await newEmail.save();

                socketService.sendNotification('new-email', {
                  id: newEmail._id,
                  from: newEmail.from,
                  subject: newEmail.subject,
                  sentiment: newEmail.sentiment,
                  priority: newEmail.priority
                });
                console.log(`  ✅ Synced: ${subject.substring(0, 30)}...`);
              }

              await client.messageFlagsAdd(uid, ['\\Seen']);
            } catch (err) {
              console.error(`  ⚠️ [IMAP] Item Error (UID ${uid}):`, err.message);
            }
          }));

          console.log(`🚀 [IMAP] Progress: ${i + chunk.length}/${uids.length} synced.`);
        }
      } finally {
        lock.release();
      }

      await client.logout();
      console.log('🏁 [IMAP] Sync Session Complete.');
    } catch (error) {
      console.error('❌ [IMAP] Sync Error:', error.message);
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
