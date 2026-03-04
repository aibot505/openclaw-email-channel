/**
 * OpenClaw Integration Example for Email Channel
 * 
 * This shows how to use the email channel from within an OpenClaw agent.
 */

// Example 1: Basic email sending from an OpenClaw agent
async function sendWelcomeEmail(userEmail, userName) {
  // This would be called from within an OpenClaw agent session
  await message({
    action: "send",
    channel: "email",
    to: userEmail,
    subject: `Welcome to OpenClaw, ${userName}!`,
    text: `Hello ${userName},\n\nWelcome to OpenClaw! We're excited to have you on board.\n\nBest regards,\nThe OpenClaw Team`,
    html: `
      <h1>Welcome to OpenClaw, ${userName}!</h1>
      <p>Hello ${userName},</p>
      <p>Welcome to OpenClaw! We're excited to have you on board.</p>
      <p>Best regards,<br>The OpenClaw Team</p>
    `
  });
}

// Example 2: Processing incoming emails
async function handleIncomingEmail(emailMessage) {
  // emailMessage structure from the plugin:
  // {
  //   channel: "email",
  //   type: "email",
  //   data: { ...email details... }
  // }
  
  const email = emailMessage.data;
  
  console.log(`Processing email from ${email.from.address}: ${email.subject}`);
  
  // Check for specific keywords
  if (email.text.toLowerCase().includes("help") || email.subject.toLowerCase().includes("help")) {
    // Auto-respond to help requests
    await message({
      action: "send",
      channel: "email",
      to: email.from.address,
      subject: `Re: ${email.subject}`,
      text: `Thanks for your message! Our team will get back to you soon.\n\nFor immediate help, check our documentation: https://docs.openclaw.ai`,
      inReplyTo: email.id
    });
    
    // Also notify on Telegram/Discord
    await message({
      action: "send",
      channel: "telegram", // or "discord"
      to: "support-channel-id",
      text: `📧 New help request from ${email.from.address}:\n${email.subject}\n\n${email.text.substring(0, 200)}...`
    });
  }
  
  // Forward urgent emails
  if (email.subject.includes("URGENT") || email.subject.includes("CRITICAL")) {
    await message({
      action: "send",
      channel: "email",
      to: "admin@example.com",
      subject: `URGENT: ${email.subject}`,
      text: `Forwarded urgent email from ${email.from.address}:\n\n${email.text}`,
      attachments: email.attachments
    });
  }
}

// Example 3: Scheduled email reports
async function sendDailyReport() {
  // This could be triggered by a cron job or heartbeat
  const reportData = await generateDailyReport();
  
  await message({
    action: "send",
    channel: "email",
    to: ["team@example.com", "manager@example.com"],
    cc: "archive@example.com",
    subject: `Daily Report - ${new Date().toLocaleDateString()}`,
    text: reportData.text,
    html: reportData.html,
    attachments: [
      {
        filename: `report-${new Date().toISOString().split('T')[0]}.csv`,
        content: reportData.csv
      }
    ]
  });
}

// Example 4: Email-based command system
async function handleEmailCommand(email) {
  const command = email.text.trim().toLowerCase();
  
  if (command.startsWith("/status")) {
    const status = await getSystemStatus();
    
    await message({
      action: "send",
      channel: "email",
      to: email.from.address,
      subject: "System Status Report",
      text: `System Status:\n\n${status}`,
      inReplyTo: email.id
    });
    
  } else if (command.startsWith("/logs")) {
    const logs = await getRecentLogs();
    
    await message({
      action: "send",
      channel: "email",
      to: email.from.address,
      subject: "Recent Logs",
      text: `Recent System Logs:\n\n${logs}`,
      attachments: [
        {
          filename: "logs.txt",
          content: logs
        }
      ],
      inReplyTo: email.id
    });
    
  } else if (command.startsWith("/help")) {
    await message({
      action: "send",
      channel: "email",
      to: email.from.address,
      subject: "Available Commands",
      text: `Available Email Commands:\n\n/status - Get system status\n/logs - Get recent logs\n/help - Show this help\n\nSend any command via email to interact with OpenClaw.`,
      inReplyTo: email.id
    });
  }
}

// Example 5: Email monitoring and alerting
class EmailMonitor {
  constructor() {
    this.keywords = ["error", "failed", "critical", "outage", "down"];
    this.alertRecipients = ["oncall@example.com", "ops@example.com"];
  }
  
  async monitorIncomingEmails(email) {
    const content = (email.text + ' ' + email.subject).toLowerCase();
    
    for (const keyword of this.keywords) {
      if (content.includes(keyword)) {
        await this.sendAlert(email, keyword);
        break;
      }
    }
  }
  
  async sendAlert(email, keyword) {
    const alertMessage = `
🚨 ALERT: Email containing "${keyword}" detected

From: ${email.from.address}
Subject: ${email.subject}
Time: ${new Date().toISOString()}

Content preview:
${email.text.substring(0, 500)}...
`;
    
    // Send alert via email
    await message({
      action: "send",
      channel: "email",
      to: this.alertRecipients,
      subject: `ALERT: ${keyword.toUpperCase()} detected in email from ${email.from.address}`,
      text: alertMessage
    });
    
    // Also send to other channels
    await message({
      action: "send",
      channel: "telegram",
      to: "alerts-channel",
      text: alertMessage
    });
  }
}

// Helper functions (would be implemented in your OpenClaw setup)
async function generateDailyReport() {
  // Generate report data
  return {
    text: "Daily report content...",
    html: "<h1>Daily Report</h1><p>Content...</p>",
    csv: "date,metric,value\n2024-01-01,users,100\n2024-01-01,requests,1000"
  };
}

async function getSystemStatus() {
  // Get system status
  return "All systems operational";
}

async function getRecentLogs() {
  // Get recent logs
  return "Log entries...";
}

// Export for use in OpenClaw agents
module.exports = {
  sendWelcomeEmail,
  handleIncomingEmail,
  sendDailyReport,
  handleEmailCommand,
  EmailMonitor
};