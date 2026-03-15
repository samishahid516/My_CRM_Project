const mongoose = require('mongoose');
require('dotenv').config();
const Email = require('./models/Email');
const AIService = require('./services/aiService');
const connectDB = require('./config/db');

// ═══════════════════════════════════════════════════════════════
// SEED DATA - 50 Realistic Email Samples
// ═══════════════════════════════════════════════════════════════

const sampleEmails = [
  // ── ANGRY EMAILS ──────────────────────────────────
  {
    from: { name: 'Robert Chen', email: 'robert.chen@techfirm.com' },
    subject: 'URGENT: Unacceptable Service Downtime - IMMEDIATE Action Required!',
    body: 'This is absolutely unacceptable! Our entire system has been down for 6 hours because of YOUR service outage. We are losing thousands of dollars every hour. I demand an immediate explanation and resolution. If this is not fixed within the next hour, we will be terminating our contract and pursuing legal action. This is the third outage this month and I am furious beyond words. Your support team has been completely useless - nobody answers the phone and the chat bot keeps giving us the runaround. FIX THIS NOW!'
  },
  {
    from: { name: 'Sarah Martinez', email: 'sarah.m@globalcorp.com' },
    subject: 'Complaint: Terrible Customer Support Experience',
    body: 'I have been trying to reach your customer support for the past 3 days and I am extremely frustrated. I was put on hold for 45 minutes, transferred to 4 different departments, and nobody could help me. This is the worst customer service experience I have ever had. I am seriously considering switching to your competitor. Your product quality has been declining rapidly and this poor support is the final straw. I want a full refund for the last quarter and I want to speak to a manager immediately.'
  },
  {
    from: { name: 'David Kim', email: 'dkim@enterprise.io' },
    subject: 'CRITICAL: Security Breach in Your Platform!',
    body: 'We have discovered a critical security vulnerability in your platform that has potentially exposed our customer data. This is a serious breach of our SLA agreement and we demand an immediate investigation. Our security team found unauthorized access logs dating back two weeks. This is absolutely catastrophic and heads need to roll. We need a complete incident report within 24 hours and a detailed remediation plan. Legal is already involved on our end. This negligence is beyond unacceptable!'
  },
  {
    from: { name: 'Lisa Thompson', email: 'lisa.t@retailchain.com' },
    subject: 'Worst Product Update Ever - Broke Everything!',
    body: 'Your latest product update has completely destroyed our workflow. Nothing works anymore! The dashboard crashes every 5 minutes, reports are showing wrong data, and we cannot process any orders. My entire team of 50 people cannot work. This is costing us an estimated $50,000 per hour in lost revenue. I am disgusted by the lack of testing your team obviously did not do. Roll back this update IMMEDIATELY or we are done with your company forever!'
  },
  {
    from: { name: 'Mike O\'Brien', email: 'mobrien@lawfirm.co' },
    subject: 'Legal Notice: Breach of Contract',
    body: 'This email serves as formal notice that your company is in breach of our service level agreement. Over the past month, we have experienced 12 separate service disruptions, each lasting more than 30 minutes. Per clause 7.3 of our agreement, you are required to maintain 99.9% uptime. Your actual uptime has been approximately 95%. We are demanding immediate compensation as outlined in the SLA penalty clauses. Our legal team will be reaching out to discuss further action if this is not resolved within 48 hours. I am extremely disappointed in the complete lack of professionalism.'
  },

  // ── NEGATIVE EMAILS ───────────────────────────────
  {
    from: { name: 'Jennifer Walsh', email: 'jen.walsh@startup.co' },
    subject: 'Disappointed with Recent Changes',
    body: 'I have been a loyal customer for 3 years but I am really disappointed with the recent changes to the pricing structure. The new plans are significantly more expensive and we are not seeing any additional value. Several features we relied on have been moved to higher tiers. I am not happy about this and would like to discuss options before we consider alternatives. This feels like a bait and switch and it is quite disappointing from a company we trusted.'
  },
  {
    from: { name: 'Thomas Williams', email: 'twilliams@design.agency' },
    subject: 'Issues with Billing - Overcharged Again',
    body: 'I noticed we were overcharged again this month. Our bill shows $2,450 when our plan should only cost $1,800. This is the second time in three months and it is becoming a pattern. I need a detailed invoice breakdown and a refund for the overcharge. I also want assurance that this will not happen again. If these billing errors continue, we will need to reconsider our partnership. Please address this with some urgency.'
  },
  {
    from: { name: 'Amanda Foster', email: 'afoster@healthcare.org' },
    subject: 'Concerned About Data Privacy Compliance',
    body: 'We are concerned that your platform may not be fully compliant with the latest HIPAA regulations. During our recent audit, several potential compliance gaps were identified in how patient data is stored and transmitted through your system. We need a detailed compliance report and evidence of your HIPAA certification. If we cannot verify compliance within the next two weeks, we may be forced to migrate to a different provider. This is a serious matter that affects patient safety.'
  },
  {
    from: { name: 'Ryan Park', email: 'rpark@fintech.com' },
    subject: 'Feature Request Not Addressed - Feeling Ignored',
    body: 'I submitted a critical feature request 6 months ago that would dramatically improve our workflow. Despite multiple follow-ups, I have received no updates on its status. It feels like our input as a paying customer is being ignored. Several other customers in your community forum have echoed similar frustrations. The lack of communication is disheartening. Can someone please provide a concrete timeline or at least acknowledge that our request has been considered?'
  },
  {
    from: { name: 'Patricia Brown', email: 'pbrown@education.edu' },
    subject: 'Performance Issues Affecting Our Operations',
    body: 'Over the past two weeks, we have experienced significant performance degradation in your platform. Page load times have increased from under 2 seconds to over 10 seconds, and our teachers are unable to grade assignments efficiently. This is negatively impacting our students and the overall educational experience. Our IT team has confirmed the issue is on your end. We need this resolved soon as final exams are approaching and the timing could not be worse.'
  },

  // ── NEUTRAL EMAILS ────────────────────────────────
  {
    from: { name: 'James Wilson', email: 'jwilson@corp.com' },
    subject: 'Quarterly Review Meeting Schedule',
    body: 'Hi team, I wanted to reach out to schedule our quarterly review meeting. Could you send over some available times for next week? We have several items to discuss including the current project status, upcoming milestones, and resource allocation for Q2. Please have your department reports ready by Friday. Looking forward to a productive meeting.'
  },
  {
    from: { name: 'Catherine Lee', email: 'clee@consulting.com' },
    subject: 'Information Request: API Documentation',
    body: 'Hello, I am currently evaluating your platform for our clients and would appreciate access to your full API documentation. Specifically, I am interested in the webhooks, authentication methods, and rate limiting details. Could you point me to the relevant resources or send them directly? I would also appreciate any case studies you may have from similar implementations in the consulting sector.'
  },
  {
    from: { name: 'Mark Stevens', email: 'mstevens@logistics.com' },
    subject: 'Account Setup Assistance',
    body: 'We recently purchased an enterprise license and need assistance setting up our account. We have 200 users who need to be onboarded over the next month. Could you provide us with the admin setup guide and any bulk user import tools? We also need to configure SSO with Azure Active Directory. Please let us know what information you need from our end to get started.'
  },
  {
    from: { name: 'Diana Ramirez', email: 'dramirez@nonprofit.org' },
    subject: 'Renewal Inquiry',
    body: 'Our annual subscription is coming up for renewal next month. I wanted to inquire about any changes to the pricing or features for the upcoming year. We are also curious about the new analytics module that was mentioned in your last newsletter. Could you send us a comparison of our current plan versus the updated offerings? We want to make sure we are getting the best value for our organization.'
  },
  {
    from: { name: 'George Anderson', email: 'ganderson@manufacturing.com' },
    subject: 'Training Session Request',
    body: 'Our team has grown by 30 members since our last training session. We would like to schedule another round of training to bring everyone up to speed on the platform features. Could you provide available dates and pricing for an on-site training session? We are flexible on dates but would prefer sometime in the next 4-6 weeks. The training should cover basic operations, reporting, and advanced customization.'
  },
  {
    from: { name: 'Susan Clark', email: 'sclark@insurance.com' },
    subject: 'Integration Options',
    body: 'We are currently using Salesforce and are wondering about integration options with your platform. Specifically, we need real-time data synchronization for contact records, deal stages, and activity logs. Do you have a native integration or would we need to use a third-party tool like Zapier? Any documentation on the setup process would be helpful. No rush on this - just exploring options for next quarter.'
  },
  {
    from: { name: 'Alan Bennett', email: 'abennett@telecom.net' },
    subject: 'Monthly Usage Report Request',
    body: 'Could you generate and send over the monthly usage report for our account for the past quarter? We need this for our internal budget review. The report should include user activity, API call volumes, storage utilization, and any overage charges. Please send it in CSV format if possible. Our finance team needs this by end of next week.'
  },

  // ── POSITIVE EMAILS ───────────────────────────────
  {
    from: { name: 'Emily Zhang', email: 'ezhang@innovate.tech' },
    subject: 'Great Improvement in the Latest Release',
    body: 'I wanted to drop a note to say that the latest release has made a noticeable improvement in our workflow. The new batch processing feature has cut our data import time by 60%. Our team is quite pleased with the direction the product is heading. The UI improvements are also clean and intuitive. Keep up the good work. We are looking forward to what comes next and would love to provide beta feedback on upcoming features.'
  },
  {
    from: { name: 'Carlos Rivera', email: 'crivera@media.group' },
    subject: 'Interested in Upgrading Our Plan',
    body: 'Our business has grown significantly this year and we are ready to upgrade to your premium plan. We need more storage, advanced reporting, and priority support. Could you walk us through the upgrade process and any migration steps we should be aware of? We would also like to understand the additional features included in the premium tier. Our budget has been approved and we are ready to proceed whenever convenient.'
  },
  {
    from: { name: 'Rachel White', email: 'rwhite@ecommerce.store' },
    subject: 'Successful Migration - Thank You!',
    body: 'I wanted to let you know that our data migration was completed successfully last weekend. The process was smooth and your migration team did an excellent job guiding us through every step. All 500,000 records transferred without any issues. Our operations are running well on the new system. I appreciate the extra effort your team put in, especially staying late on Saturday to help us troubleshoot the custom field mappings. Well done!'
  },
  {
    from: { name: 'Daniel Harris', email: 'dharris@biotech.inc' },
    subject: 'Referral - Recommending Your Platform',
    body: 'I have recommended your platform to two colleagues in the biotech industry. They will be reaching out soon for demos. Our experience has been consistently positive since we started using your product 18 months ago. The reliability and feature set are exactly what our industry needs. I believe your platform would be a great fit for their organizations as well. Please give them the VIP treatment!'
  },
  {
    from: { name: 'Natalie Scott', email: 'nscott@fashion.brand' },
    subject: 'Positive Support Experience',
    body: 'I had a wonderful experience with your support representative, Alex, today. He helped me resolve a complex custom report configuration issue in under 30 minutes. His knowledge and patience were remarkable. Please pass along my thanks to his manager. It is rare to encounter such competent and friendly technical support. This kind of service is why we continue to choose your platform over competitors.'
  },

  // ── HAPPY EMAILS ──────────────────────────────────
  {
    from: { name: 'Jessica Morgan', email: 'jmorgan@creative.agency' },
    subject: 'Absolutely Love the New Dashboard! 🎉',
    body: 'Oh my goodness, the new dashboard is AMAZING! Our entire team is thrilled with the redesign. The drag-and-drop widgets, the real-time analytics, and the beautiful visualizations are exactly what we have been dreaming of. This is hands down the best update you have ever released. We had a team meeting today and everyone was gushing about how much more productive they feel. You have seriously exceeded our expectations. Thank you, thank you, thank you! 🥳'
  },
  {
    from: { name: 'Andrew Price', email: 'aprice@gaming.studio' },
    subject: 'Best Decision We Ever Made! 🚀',
    body: 'Switching to your platform was the best business decision we made this year! Our team productivity has increased by 40%, customer response times are down by 65%, and our overall satisfaction scores have never been higher. The automated workflows have been a game-changer for us. We literally could not imagine going back to our old system. Every single team member loves it. Keep doing what you are doing because it is brilliant! 🌟'
  },
  {
    from: { name: 'Maria Gonzalez', email: 'mgonzalez@restaurant.chain' },
    subject: 'Your Team is Incredible! ❤️',
    body: 'I just have to say that your customer success team is hands down the best I have ever worked with in my 20 years of business. Sarah and Tom went above and beyond to help us set up our multi-location dashboard. They even created custom training videos for our regional managers. The level of dedication and care is truly heartwarming. We feel like a valued partner, not just a customer number. You have customers for life! 💯'
  },
  {
    from: { name: 'Kevin Brown', email: 'kbrown@sports.org' },
    subject: 'Outstanding ROI - Management is Thrilled!',
    body: 'I presented our quarterly performance review to the board yesterday and they were absolutely thrilled with the ROI from your platform. We have seen a 300% return on our investment in just 8 months. The advanced analytics gave us insights we never knew were possible. Marketing spend has been optimized, customer retention is up 25%, and our team morale has skyrocketed because the tools are so easy and enjoyable to use. The board authorized expanding our license to include all departments! 🎯'
  },
  {
    from: { name: 'Sophia Turner', email: 'sturner@wellness.co' },
    subject: 'Perfect Partnership - 2 Year Anniversary! 🎂',
    body: 'Can you believe it has been 2 years since we partnered together? What an incredible journey it has been! From a small team of 10 to now over 200 employees, your platform has scaled beautifully with us every step of the way. The customization options, the reliability, and the support have been nothing short of phenomenal. Here is to many more years of growing together! Thank you for being such a wonderful partner! 🥂✨'
  },

  // ── MORE EMAILS FOR VARIETY ───────────────────────
  {
    from: { name: 'Chris Taylor', email: 'ctaylor@real-estate.com' },
    subject: 'URGENT: Data Export Not Working',
    body: 'This is urgent - I have a client presentation in 2 hours and the data export feature is completely broken. I keep getting error 500 when trying to export our quarterly sales report. I have tried multiple browsers and different export formats. Nothing works. This is extremely time-sensitive and I need help right now. Our entire deal pipeline data is locked in your system and I cannot access it. Please escalate this immediately!'
  },
  {
    from: { name: 'Laura Nelson', email: 'lnelson@pharma.corp' },
    subject: 'Compliance Documentation Needed',
    body: 'As part of our annual regulatory audit, we need updated compliance documentation for your platform. Specifically, we require SOC 2 Type II certification, GDPR data processing agreements, and documentation on your data retention policies. Could you provide these documents within the next two weeks? This is a routine request but it is mandatory for our continued operations. Please direct this to your compliance department.'
  },
  {
    from: { name: 'Victor Patel', email: 'vpatel@automotive.inc' },
    subject: 'Partnership Proposal - Exciting Opportunity',
    body: 'I represent the digital transformation division at AutoMotion Inc., and I believe there is a tremendous opportunity for our companies to collaborate. We are looking for a technology partner to help digitize our dealer network of 500+ locations across the country. Your platform capabilities align perfectly with our needs. I would love to arrange a meeting to discuss a potential strategic partnership. This could be a multi-million dollar engagement over 3 years. Are you available for a call next week?'
  },
  {
    from: { name: 'Helen Cooper', email: 'hcooper@airline.com' },
    subject: 'Custom Integration Development Request',
    body: 'We need to develop a custom integration between your platform and our proprietary reservation system. This integration would need to handle real-time booking data, passenger profiles, and loyalty program information. Could you provide an estimate for custom development work? We have budget allocated for this project and would like to kick off development within the next 6 weeks. Please schedule a technical discovery call with our engineering team.'
  },
  {
    from: { name: 'Frank Garcia', email: 'fgarcia@construction.co' },
    subject: 'Thank You for the Quick Resolution',
    body: 'I wanted to follow up and express my gratitude for the quick resolution of our access issue yesterday. Your support team, particularly Janet, was incredibly responsive and had us back up and running within 15 minutes. In the construction business, any downtime means crews sitting idle and money being wasted. Your fast response prevented what could have been a very costly day for us. Great job and we appreciate the reliability of your service.'
  },
  {
    from: { name: 'Rebecca Moore', email: 'rmoore@university.edu' },
    subject: 'Academic Licensing Inquiry',
    body: 'I am the Dean of the Computer Science department at Westfield University and I am interested in your academic licensing program. We would like to provide our students with hands-on experience using industry-standard CRM tools. Could you share details about academic pricing, any available grants or sponsorships, and the application process? We have approximately 500 students per year who would benefit from access to your platform.'
  },
  {
    from: { name: 'Steven Wright', email: 'swright@energy.net' },
    subject: 'FRUSTRATED: Third Ticket Without Response',
    body: 'This is my THIRD support ticket about the same issue and I have yet to receive a meaningful response. Our API integration keeps dropping connections during peak hours and it is causing data synchronization failures across our entire energy monitoring network. We monitor thousands of endpoints and each failure means potential safety risks. I am extremely frustrated with the lack of attention this is getting. Please have a senior engineer contact me TODAY. This cannot wait any longer.'
  },
  {
    from: { name: 'Angela Davis', email: 'adavis@charity.org' },
    subject: 'Wonderful Donation Tracking Features',
    body: 'I am absolutely delighted with the donation tracking features you recently added. As a nonprofit, tracking donor contributions and generating tax receipts used to take us days. Now it is automated and beautiful! The donor dashboard gives our team real-time visibility into campaign performance. We successfully tracked over $2 million in donations this quarter without a single manual entry. Your platform has truly transformed how we operate. Thank you for thinking of organizations like ours!'
  },
  {
    from: { name: 'Peter Johnson', email: 'pjohnson@bank.com' },
    subject: 'Quarterly Business Review Request',
    body: 'It is time for our quarterly business review and I would like to schedule a meeting with your account management team. We would like to review our usage metrics, discuss planned feature releases, and evaluate our return on investment. Could you prepare a comprehensive QBR deck including user adoption rates, feature utilization stats, and benchmarks against similar accounts? We prefer a meeting in the second week of next month. Please confirm availability.'
  },
  {
    from: { name: 'Olivia Sanders', email: 'osanders@hotel.chain' },
    subject: 'Absolutely Thrilled with Results! ⭐',
    body: 'The results from implementing your platform across our 50 hotel properties have been nothing short of spectacular! Guest satisfaction scores are up 35%, staff efficiency improved by 50%, and we are saving an estimated $500,000 annually on operational costs. The real-time guest feedback module has been a revelation - we can now address concerns before guests even check out. Your implementation team deserves all the praise. We are already planning to expand to our international properties! 🌍'
  },
  {
    from: { name: 'William Clark', email: 'wclark@law.group' },
    subject: 'Urgent: Document Access Error',
    body: 'Several of our attorneys are unable to access critical case documents stored in your platform. We have a court deadline tomorrow morning and this is causing significant problems. The error message says "insufficient permissions" but these users had access yesterday. Something changed overnight. I need this resolved within the hour. We cannot afford to miss a court filing deadline due to a technical glitch. Please treat this as an absolute emergency.'
  },
  {
    from: { name: 'Nancy Adams', email: 'nadams@retail.store' },
    subject: 'Inventory Module Feedback',
    body: 'I have been using the new inventory management module for about a month now and wanted to share some feedback. The automated reorder points are working well, but I think the low stock alerts could be more customizable. Currently we can only set one threshold per product category, but we need different thresholds for seasonal items versus everyday stock. Also, the barcode scanning feature occasionally misreads certain formats. Overall it is a solid improvement over what we had before, but these tweaks would make it even better.'
  },
  {
    from: { name: 'Timothy Lee', email: 'tlee@logistics.express' },
    subject: 'Contract Renewal Discussion',
    body: 'Our current contract expires in 60 days and I wanted to initiate renewal discussions. We are generally satisfied with the service and would like to continue our partnership. However, we would like to negotiate a few points: volume discounts based on our increased usage, the addition of the enterprise security module at a bundled rate, and extended support hours to cover our APAC operations. Could you have your accounts team prepare a renewal proposal? We are open to a multi-year commitment if the terms are favorable.'
  },
  {
    from: { name: 'Christine Nguyen', email: 'cnguyen@media.co' },
    subject: 'Feature Spotlight Submission',
    body: 'Hi, I noticed you feature customer success stories in your monthly newsletter. We would love to be featured! Since implementing your platform, our content production team has increased output by 200% while maintaining quality standards. We have some great metrics and before-after comparisons that would make for a compelling story. Our marketing team can provide quotes, screenshots, and even a short video testimonial. Let me know if you are interested and what the process looks like.'
  },
  {
    from: { name: 'Robert Zhang', email: 'rzhang@aerospace.tech' },
    subject: 'Security Audit Results - Passed!',
    body: 'Great news! Our third-party security audit of your platform has been completed and I am pleased to report that it passed all critical requirements. The audit team was particularly impressed with your encryption standards and access control mechanisms. There are a few minor recommendations which I will send in a separate report, but nothing that would prevent us from expanding our usage. This gives us the green light to onboard our classified projects team. Well done to your security engineering group.'
  },
  {
    from: { name: 'Margaret Hill', email: 'mhill@healthcare.group' },
    subject: 'Disappointed with Response Times',
    body: 'I am writing to express my disappointment with the response times from your support team. Our latest ticket took 5 days to get a first response, which is well outside the 24-hour SLA. While the actual resolution was acceptable once someone picked up the ticket, the wait time is not meeting our expectations, especially given the premium rate we pay for priority support. We need to see improvement in this area or we will need to consider other options that can guarantee faster response times.'
  },
  {
    from: { name: 'Douglas Young', email: 'dyoung@government.gov' },
    subject: 'FedRAMP Certification Inquiry',
    body: 'Our department is evaluating your platform for potential deployment across federal offices. A key requirement is FedRAMP certification. Could you confirm whether your platform has achieved FedRAMP authorization, and if so, at what impact level? If you are currently in the process, could you share your expected timeline for achieving certification? Additionally, we need information about your data sovereignty capabilities and whether data can be guaranteed to remain within US borders. This inquiry is for a potential 5-year, multi-agency contract.'
  },
  {
    from: { name: 'Samantha King', email: 'sking@startup.fund' },
    subject: 'Impressed After Demo - Ready to Sign! 🎯',
    body: 'Just finished the product demo with your sales team and I am thoroughly impressed! The AI-powered analytics and predictive modeling features are exactly what our venture portfolio companies need. I am ready to sign up for the enterprise plan immediately for our 15 portfolio companies. Can you send over the enterprise agreement? We are also interested in becoming a reseller partner if that program exists. Let us move fast on this - I have budget approval and want to get our companies onboarded this month!'
  },
  {
    from: { name: 'Edward Wilson', email: 'ewilson@sports.league' },
    subject: 'Feedback on Mobile App Experience',
    body: 'The mobile app has been a mixed experience for our field scouts. The core functionality works well and they appreciate being able to enter player evaluations on the go. However, the app frequently loses unsaved data when switching between apps on their tablets. This has caused considerable frustration as some evaluations take 20-30 minutes to complete. The offline mode also needs improvement - sync conflicts are common when scouts re-enter coverage areas. The desktop version remains excellent though.'
  },
  {
    from: { name: 'Isabella Martinez', email: 'imartinez@food.co' },
    subject: 'Supply Chain Module Enhancement Request',
    body: 'We love the core supply chain tracking features but have a few enhancement requests. First, we need the ability to track multiple temperature zones within a single shipment. Second, the compliance reporting needs to support FDA food safety requirements. Third, we would like predictive analytics for demand forecasting based on historical seasonal patterns. These features would be extremely valuable for the food and beverage industry. Happy to participate in beta testing if you decide to develop these. We are a satisfied customer who wants to see the product grow!'
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    
    // Clear existing data
    await Email.deleteMany({});
    console.log('🗑️  Cleared existing emails');

    // Process each email through AI analysis and save
    const processedEmails = [];
    
    for (const emailData of sampleEmails) {
      const analysis = AIService.analyzeEmail(emailData);
      
      // Random dates within the past 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(createdAt.getHours() - hoursAgo);

      // Random status
      const statuses = ['unread', 'unread', 'unread', 'read', 'read', 'replied', 'archived'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const email = new Email({
        ...emailData,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        priority: analysis.priority,
        priorityScore: analysis.priorityScore,
        category: analysis.category,
        autoReply: analysis.autoReply,
        tags: analysis.tags,
        status: randomStatus,
        isStarred: Math.random() > 0.7,
        createdAt,
        updatedAt: createdAt
      });

      processedEmails.push(email);
    }

    await Email.insertMany(processedEmails);
    
    console.log(`\n✅ Successfully seeded ${processedEmails.length} emails!\n`);
    
    // Display summary
    const sentimentCounts = {};
    const priorityCounts = {};
    processedEmails.forEach(e => {
      sentimentCounts[e.sentiment] = (sentimentCounts[e.sentiment] || 0) + 1;
      priorityCounts[e.priority] = (priorityCounts[e.priority] || 0) + 1;
    });
    
    console.log('📊 Sentiment Distribution:');
    Object.entries(sentimentCounts).forEach(([s, c]) => console.log(`   ${s}: ${c}`));
    console.log('\n🎯 Priority Distribution:');
    Object.entries(priorityCounts).forEach(([p, c]) => console.log(`   ${p}: ${c}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
