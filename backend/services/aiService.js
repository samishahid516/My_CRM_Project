const Sentiment = require('sentiment');
const sentimentAnalyzer = new Sentiment();

// ═══════════════════════════════════════════════════════════════
// AI SERVICE - Email Intelligence Engine
// Handles: Sentiment Analysis, Priority Classification,
//          Category Detection, Auto-Reply Generation
// ═══════════════════════════════════════════════════════════════

// Priority keywords that indicate urgency
const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'immediately', 'asap', 'critical', 'emergency', 'deadline',
  'important', 'priority', 'escalate', 'serious', 'legal', 'lawsuit',
  'breach', 'security', 'outage', 'downtime', 'broken', 'failing',
  'cancel', 'refund', 'complaint', 'unacceptable', 'frustrated',
  'disappointed', 'angry', 'furious', 'terrible', 'worst', 'threatening'
];

const LOW_PRIORITY_KEYWORDS = [
  'thanks', 'appreciate', 'wonderful', 'great', 'suggestion',
  'feedback', 'newsletter', 'update', 'fyi', 'no rush', 'whenever',
  'optional', 'consider', 'thought', 'idea', 'curious'
];

// Category detection patterns
const CATEGORY_PATTERNS = {
  complaint: ['complaint', 'unhappy', 'dissatisfied', 'terrible', 'worst', 'refund', 'unacceptable', 'poor service', 'disappointed'],
  inquiry: ['question', 'wondering', 'how do', 'can you tell', 'information', 'details', 'learn more', 'interested in'],
  feedback: ['feedback', 'suggestion', 'recommend', 'improvement', 'thought you should know', 'wanted to share'],
  support: ['help', 'issue', 'problem', 'error', 'bug', 'not working', 'broken', 'fix', 'trouble', 'unable to'],
  billing: ['invoice', 'payment', 'charge', 'billing', 'subscription', 'plan', 'pricing', 'cost', 'fee', 'refund'],
  partnership: ['partnership', 'collaborate', 'opportunity', 'proposal', 'business', 'venture', 'cooperation']
};

// Auto-reply templates by sentiment and category
const REPLY_TEMPLATES = {
  angry: {
    complaint: "Dear {name},\n\nI sincerely apologize for the experience you've described. Your concerns are extremely important to us, and I want you to know that we take this matter very seriously.\n\nI've escalated your case to our senior management team for immediate review. We will:\n\n1. Investigate the root cause of this issue within 24 hours\n2. Assign a dedicated representative to your case\n3. Provide you with a detailed resolution plan\n\nPlease know that we value your business and are committed to making this right. You can expect a follow-up call from our team lead within the next 4 hours.\n\nWith sincere apologies,\nCRM Intelligence Team",
    support: "Dear {name},\n\nI'm truly sorry for the frustration you're experiencing with our service. I understand how important this is, and I want to help resolve this as quickly as possible.\n\nI've flagged your issue as HIGH PRIORITY and our technical team is already looking into it. Here's what we're doing:\n\n1. Our engineering team has been alerted\n2. We're investigating the root cause right now\n3. You'll receive a status update within 2 hours\n\nIn the meantime, if you need immediate assistance, please don't hesitate to call our priority hotline.\n\nBest regards,\nCRM Intelligence Support",
    default: "Dear {name},\n\nThank you for reaching out. I understand your frustration and I want to assure you that your concerns are being taken very seriously.\n\nI've personally flagged this for immediate attention. Our team will review your case and get back to you within 24 hours with a concrete resolution plan.\n\nWe truly value your feedback and are committed to improving your experience.\n\nSincerely,\nCRM Intelligence Team"
  },
  negative: {
    complaint: "Dear {name},\n\nThank you for bringing this to our attention. We're sorry to hear about your experience and we want to make things right.\n\nWe've logged your concerns and will be reviewing them carefully. A member of our customer success team will reach out to you within 24 hours to discuss how we can resolve this.\n\nYour satisfaction is our top priority.\n\nBest regards,\nCRM Intelligence Team",
    default: "Dear {name},\n\nThank you for your honest feedback. We appreciate you taking the time to share your experience with us.\n\nWe take all feedback seriously and will use your input to improve our services. A team member will follow up with you shortly to address your concerns.\n\nBest regards,\nCRM Intelligence Team"
  },
  happy: {
    feedback: "Dear {name},\n\nThank you so much for your wonderful feedback! It truly makes our day to hear that you've had a positive experience.\n\nWe're constantly working to improve our services, and hearing success stories like yours motivates our entire team. We'd love to feature your experience in our customer spotlight – would you be interested?\n\nThank you for being a valued customer!\n\nWarm regards,\nCRM Intelligence Team",
    default: "Dear {name},\n\nThank you for your kind words! We're thrilled to hear about your positive experience.\n\nOur team works hard to deliver the best possible service, and your feedback is truly appreciated. Please don't hesitate to reach out if there's anything else we can help with.\n\nBest wishes,\nCRM Intelligence Team"
  },
  positive: {
    partnership: "Dear {name},\n\nThank you for reaching out regarding this exciting opportunity. We're always open to exploring partnerships that create mutual value.\n\nI'd love to schedule a call to discuss this further. Could you share your availability for next week? In the meantime, I'll prepare some information about our partnership programs.\n\nLooking forward to connecting!\n\nBest regards,\nCRM Intelligence Team",
    default: "Dear {name},\n\nThank you for your message! We appreciate your positive engagement with our team.\n\nWe'll review your message and get back to you with any information or next steps. Please feel free to reach out anytime.\n\nBest regards,\nCRM Intelligence Team"
  },
  neutral: {
    inquiry: "Dear {name},\n\nThank you for your inquiry. We're happy to help!\n\nI've forwarded your question to the appropriate team, and you can expect a detailed response within 24-48 hours. In the meantime, you might find helpful information on our FAQ page.\n\nDon't hesitate to reach out if you have any additional questions.\n\nBest regards,\nCRM Intelligence Team",
    billing: "Dear {name},\n\nThank you for reaching out regarding your billing inquiry. We want to ensure everything is accurate and transparent.\n\nOur billing team will review your account and provide a detailed response within 24 hours. If you need immediate assistance, please contact our billing department directly.\n\nBest regards,\nCRM Intelligence Team",
    default: "Dear {name},\n\nThank you for your email. We've received your message and will review it promptly.\n\nA member of our team will get back to you within 1-2 business days. If your matter is urgent, please don't hesitate to call us directly.\n\nBest regards,\nCRM Intelligence Team"
  }
};

class AIService {
  /**
   * Analyze email sentiment using NLP
   */
  static analyzeSentiment(text) {
    const result = sentimentAnalyzer.analyze(text);
    const score = result.comparative;

    let sentiment;
    if (score <= -0.5) {
      sentiment = 'angry';
    } else if (score < -0.1) {
      sentiment = 'negative';
    } else if (score <= 0.1) {
      sentiment = 'neutral';
    } else if (score <= 0.5) {
      sentiment = 'positive';
    } else {
      sentiment = 'happy';
    }

    return {
      sentiment,
      score: Math.round(score * 100) / 100,
      tokens: result.tokens,
      positiveWords: result.positive,
      negativeWords: result.negative
    };
  }

  /**
   * Classify email priority based on content analysis
   */
  static classifyPriority(text, sentimentResult) {
    const lowerText = text.toLowerCase();
    let priorityScore = 50;

    // Check for high priority keywords
    HIGH_PRIORITY_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        priorityScore += 15;
      }
    });

    // Check for low priority keywords
    LOW_PRIORITY_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        priorityScore -= 10;
      }
    });

    // Sentiment affects priority
    if (sentimentResult.sentiment === 'angry') priorityScore += 30;
    if (sentimentResult.sentiment === 'negative') priorityScore += 15;
    if (sentimentResult.sentiment === 'happy') priorityScore -= 10;

    // Exclamation marks and caps indicate urgency
    const exclamationCount = (text.match(/!/g) || []).length;
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    priorityScore += exclamationCount * 3;
    if (capsRatio > 0.4) priorityScore += 20;

    // Clamp score
    priorityScore = Math.max(0, Math.min(100, priorityScore));

    let priority;
    if (priorityScore >= 65) {
      priority = 'high';
    } else if (priorityScore >= 35) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    return { priority, priorityScore };
  }

  /**
   * Detect email category
   */
  static detectCategory(text) {
    const lowerText = text.toLowerCase();
    let maxMatches = 0;
    let detectedCategory = 'general';

    for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      let matches = 0;
      patterns.forEach(pattern => {
        if (lowerText.includes(pattern)) matches++;
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedCategory = category;
      }
    }

    return detectedCategory;
  }

  /**
   * Generate auto-reply suggestion
   */
  static generateAutoReply(senderName, sentiment, category) {
    const templates = REPLY_TEMPLATES[sentiment] || REPLY_TEMPLATES.neutral;
    const template = templates[category] || templates.default;
    return template.replace(/{name}/g, senderName);
  }

  /**
   * Suggest reply format based on sentiment
   */
  static suggestFormat(sentiment, category) {
    if (sentiment === 'angry' || sentiment === 'negative') {
      return 'empathetic-professional';
    }
    if (category === 'partnership') return 'collaborative';
    if (category === 'billing') return 'formal';
    if (sentiment === 'happy' || sentiment === 'positive') return 'friendly-professional';
    return 'professional';
  }

  /**
   * Generate tags for the email
   */
  static generateTags(text, sentiment, priority, category) {
    const tags = [sentiment, priority, category];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('urgent')) tags.push('urgent');
    if (lowerText.includes('follow up') || lowerText.includes('follow-up')) tags.push('follow-up');
    if (lowerText.includes('meeting')) tags.push('meeting');
    if (lowerText.includes('deadline')) tags.push('deadline');
    if (lowerText.includes('budget') || lowerText.includes('cost')) tags.push('financial');

    return [...new Set(tags)];
  }

  /**
   * Full AI analysis pipeline
   */
  static analyzeEmail(email) {
    const fullText = `${email.subject} ${email.body}`;
    
    // Step 1: Sentiment Analysis
    const sentimentResult = this.analyzeSentiment(fullText);
    
    // Step 2: Priority Classification
    const priorityResult = this.classifyPriority(fullText, sentimentResult);
    
    // Step 3: Category Detection
    const category = this.detectCategory(fullText);
    
    // Step 4: Auto-Reply Generation
    const autoReply = this.generateAutoReply(
      email.from?.name || 'Valued Customer',
      sentimentResult.sentiment,
      category
    );
    
    // Step 5: Format Suggestion
    const format = this.suggestFormat(sentimentResult.sentiment, category);
    
    // Step 6: Tag Generation
    const tags = this.generateTags(fullText, sentimentResult.sentiment, priorityResult.priority, category);

    return {
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      priority: priorityResult.priority,
      priorityScore: priorityResult.priorityScore,
      category,
      autoReply: {
        suggested: autoReply,
        format
      },
      tags,
      analysis: {
        positiveWords: sentimentResult.positiveWords,
        negativeWords: sentimentResult.negativeWords,
        tokenCount: sentimentResult.tokens?.length || 0
      }
    };
  }
}

module.exports = AIService;
