#!/usr/bin/env node

/**
 * Test script for OpenClaw Email Channel Plugin
 * 
 * This script demonstrates how to use the email channel plugin
 * without requiring the full OpenClaw setup.
 */

const EmailChannelPlugin = require('./email-channel-plugin.js');

// Test configuration (using environment variables or defaults)
const config = {
  imap: {
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.IMAP_PORT) || 993,
    user: process.env.IMAP_USER || 'test@example.com',
    password: process.env.IMAP_PASSWORD || 'test-password',
    tls: process.env.IMAP_TLS !== 'false',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || 'test@example.com',
    password: process.env.SMTP_PASSWORD || 'test-password',
    secure: process.env.SMTP_SECURE === 'true',
  },
  emailAddress: process.env.EMAIL_ADDRESS || 'test@example.com',
  pollInterval: parseInt(process.env.POLL_INTERVAL) || 10000,
  markSeen: process.env.MARK_SEEN !== 'false',
  saveAttachments: process.env.SAVE_ATTACHMENTS === 'true',
  attachmentsDir: process.env.ATTACHMENTS_DIR || './test-attachments',
};

console.log('Starting Email Channel Plugin Test...');
console.log('Configuration:', JSON.stringify(config, null, 2));

// Create plugin instance
const plugin = new EmailChannelPlugin(config);

// Set up event handlers
plugin.on('connected', () => {
  console.log('✅ Plugin connected successfully');
  
  // Test sending an email after connection
  setTimeout(async () => {
    console.log('Testing email sending...');
    
    try {
      const result = await plugin.sendEmail({
        to: config.emailAddress, // Send to ourselves for testing
        subject: 'Test Email from OpenClaw Plugin',
        text: 'This is a test email sent by the OpenClaw Email Channel Plugin.\n\nIf you receive this, the plugin is working correctly!',
        html: '<h1>Test Email from OpenClaw Plugin</h1><p>This is a test email sent by the <b>OpenClaw Email Channel Plugin</b>.</p><p>If you receive this, the plugin is working correctly!</p>',
      });
      
      console.log('✅ Test email sent successfully:', result.messageId);
      console.log('The email should appear in your inbox shortly.');
      
    } catch (error) {
      console.error('❌ Failed to send test email:', error.message);
    }
  }, 2000);
});

plugin.on('message', (message) => {
  console.log('📧 New email received:');
  console.log('  From:', message.data.from.address);
  console.log('  Subject:', message.data.subject);
  console.log('  Preview:', message.data.text.substring(0, 100) + '...');
  
  // Auto-reply to test emails
  if (message.data.subject.includes('Test') || message.data.subject.includes('OpenClaw')) {
    console.log('  🤖 Auto-replying to test email...');
    
    plugin.sendEmail({
      to: message.data.from.address,
      subject: `Re: ${message.data.subject}`,
      text: `Thanks for your test email! This is an auto-reply from the OpenClaw Email Channel Plugin.\n\nOriginal message: ${message.data.text.substring(0, 200)}...`,
      inReplyTo: message.data.id,
    }).then(() => {
      console.log('  ✅ Auto-reply sent');
    }).catch(err => {
      console.error('  ❌ Failed to send auto-reply:', err.message);
    });
  }
});

plugin.on('error', (error) => {
  console.error('❌ Plugin error:', error.message);
  
  // Don't exit on connection errors, just log them
  if (error.message.includes('ECONNREFUSED') || error.message.includes('Authentication failed')) {
    console.log('⚠️  Connection/Auth error - please check your credentials and network connection');
  }
});

plugin.on('disconnected', () => {
  console.log('🔌 Plugin disconnected');
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await plugin.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Terminating...');
  await plugin.disconnect();
  process.exit(0);
});

// Start the plugin
console.log('🔌 Connecting to email servers...');
plugin.connect().catch(error => {
  console.error('❌ Failed to connect:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Check your email credentials');
  console.log('2. Verify IMAP/SMTP is enabled for your email account');
  console.log('3. For Gmail, use an app password (not your regular password)');
  console.log('4. Check firewall/network settings');
  console.log('5. Try with DEBUG=* to see detailed logs');
  
  process.exit(1);
});

// Keep the script running
console.log('⏳ Plugin running. Press Ctrl+C to stop.');
console.log('📧 Listening for incoming emails...');
console.log('📤 Will send a test email in 2 seconds...');