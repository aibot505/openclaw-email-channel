#!/usr/bin/env node

/**
 * OpenClaw Email Channel Plugin
 * 
 * This plugin enables OpenClaw to send and receive emails as a communication channel.
 * Uses IMAP for receiving emails and SMTP for sending emails.
 */

const { EventEmitter } = require('events');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailChannelPlugin extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.imapClient = null;
    this.smtpTransporter = null;
    this.isConnected = false;
    this.noopInterval = null;
    
    // Validate required config
    this.validateConfig();
  }
  
  validateConfig() {
    const required = [
      'imap.host',
      'imap.port',
      'imap.user',
      'imap.password',
      'smtp.host',
      'smtp.port',
      'smtp.user',
      'smtp.password',
      'emailAddress'
    ];
    
    for (const key of required) {
      if (!this.getNestedValue(this.config, key)) {
        throw new Error(`Missing required config: ${key}`);
      }
    }
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }
  
  initializeImap() {
    this.imapClient = new Imap({
      user: this.config.imap.user,
      password: this.config.imap.password,
      host: this.config.imap.host,
      port: this.config.imap.port,
      tls: this.config.imap.tls !== false,
      tlsOptions: this.config.imap.tlsOptions || {},
      authTimeout: this.config.imap.authTimeout || 3000,
      connTimeout: this.config.imap.connTimeout || 10000,
      // Enable keepalive to maintain IDLE connection
      keepalive: {
        interval: 300000, // 5 minutes
        idleInterval: 60000, // 1 minute
        forceNoop: true
      }
    });
    
    this.imapClient.on('error', (err) => {
      console.error('IMAP error:', err);
      this.emit('error', err);
    });
    
    this.imapClient.on('end', () => {
      console.log('IMAP connection ended');
      this.isConnected = false;
      this.emit('disconnected');
    });
    
    // We'll handle new mail via IDLE instead of the 'mail' event
    this.imapClient.on('mail', (numNewMsgs) => {
      console.log(`New email(s) received via mail event: ${numNewMsgs}`);
      this.fetchNewEmails();
    });
  }
  
  initializeSmtp() {
    this.smtpTransporter = nodemailer.createTransport({
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.secure !== false,
      auth: {
        user: this.config.smtp.user,
        pass: this.config.smtp.password,
      },
      tls: this.config.smtp.tlsOptions || {},
    });
    
    // Verify SMTP connection
    this.smtpTransporter.verify((error) => {
      if (error) {
        console.error('SMTP connection error:', error);
        this.emit('error', error);
      } else {
        console.log('SMTP connection ready');
      }
    });
  }
  
  async connect() {
    return new Promise((resolve, reject) => {
      this.initializeImap();
      this.initializeSmtp();
      
      this.imapClient.connect();
      
      this.imapClient.once('ready', () => {
        console.log('IMAP connected');
        this.isConnected = true;
        this.emit('connected');
        
        // Open inbox
        this.imapClient.openBox('INBOX', false, (err, box) => {
          if (err) {
            reject(err);
            return;
          }
          console.log(`Connected to inbox, ${box.messages.total} messages`);
          
          // Start IMAP IDLE for real-time notifications
          this.startIdle();
          resolve();
        });
      });
      
      this.imapClient.once('error', reject);
    });
  }
  
  startIdle() {
    console.log('Starting IMAP IDLE for real-time email notifications...');
    
    // Initial fetch of any unseen emails
    this.fetchNewEmails();
    
    // Start IDLE mode
    this.enterIdleMode();
  }
  
  enterIdleMode() {
    if (!this.isConnected || !this.imapClient) {
      console.log('Not connected, cannot enter IDLE mode');
      return;
    }
    
    // Check if we should force NOOP instead of IDLE
    const forceNoop = this.config.imap.keepalive?.forceNoop !== false;
    
    if (forceNoop) {
      console.log('Using NOOP polling instead of IDLE (forceNoop=true)');
      this.startNoopPolling();
      return;
    }
    
    // Enter IDLE mode
    this.imapClient.idle((err) => {
      if (err) {
        console.error('IMAP IDLE error:', err);
        console.log('Falling back to NOOP polling...');
        this.startNoopPolling();
        return;
      }
      
      console.log('Entered IMAP IDLE mode, waiting for new emails...');
    });
    
    // Handle IDLE updates
    this.imapClient.on('update', (seqno, info) => {
      if (info && (info.type === 'exists' || info.type === 'expunge')) {
        console.log(`IMAP update: ${info.type}, fetching new emails...`);
        this.fetchNewEmails();
      }
    });
  }
  
  startNoopPolling() {
    // Clear any existing interval
    if (this.noopInterval) {
      clearInterval(this.noopInterval);
    }
    
    // Use keepalive interval or default to 1 minute
    const interval = this.config.imap.keepalive?.idleInterval || 60000;
    
    console.log(`Starting NOOP polling every ${interval}ms`);
    
    this.noopInterval = setInterval(() => {
      if (!this.isConnected || !this.imapClient) {
        return;
      }
      
      // Send NOOP to check for new emails
      this.imapClient.noop((err) => {
        if (err) {
          console.error('IMAP NOOP error:', err);
          return;
        }
        // NOOP will trigger 'mail' event if there are new emails
      });
    }, interval);
  }
  
  async fetchNewEmails() {
    if (!this.isConnected) {
      console.log('Not connected, skipping email fetch');
      return;
    }
    
    try {
      // Search for unseen emails
      this.imapClient.search(['UNSEEN'], (err, results) => {
        if (err) {
          console.error('Search error:', err);
          return;
        }
        
        if (!results || results.length === 0) {
          return;
        }
        
        console.log(`Found ${results.length} new email(s)`);
        
        // Fetch each new email
        const fetch = this.imapClient.fetch(results, {
          bodies: '',
          markSeen: this.config.markSeen !== false,
          struct: true,
        });
        
        fetch.on('message', (msg) => {
          let buffer = '';
          
          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });
          
          msg.once('end', async () => {
            try {
              const parsed = await simpleParser(buffer);
              await this.processEmail(parsed);
            } catch (parseErr) {
              console.error('Error parsing email:', parseErr);
            }
          });
        });
        
        fetch.once('error', (err) => {
          console.error('Fetch error:', err);
        });
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  }
  
  async processEmail(email) {
    // Extract relevant information
    const emailData = {
      id: email.messageId,
      from: email.from?.value[0] || {},
      to: email.to?.value || [],
      cc: email.cc?.value || [],
      bcc: email.bcc?.value || [],
      subject: email.subject || '(No subject)',
      text: email.text || '',
      html: email.html || '',
      date: email.date,
      attachments: email.attachments || [],
      headers: email.headers || {},
      inReplyTo: email.inReplyTo,
      references: email.references,
    };
    
    console.log(`Processing email: ${emailData.subject} from ${emailData.from.address}`);
    
    // Emit event for OpenClaw to handle
    this.emit('message', {
      channel: 'email',
      type: 'email',
      data: emailData,
      raw: email,
    });
    
    // Save attachments if configured
    if (this.config.saveAttachments && emailData.attachments.length > 0) {
      await this.saveAttachments(emailData.attachments);
    }
  }
  
  async saveAttachments(attachments) {
    const saveDir = this.config.attachmentsDir || './attachments';
    
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }
    
    for (const attachment of attachments) {
      const filename = attachment.filename || `attachment-${Date.now()}.bin`;
      const filepath = path.join(saveDir, filename);
      
      try {
        fs.writeFileSync(filepath, attachment.content);
        console.log(`Saved attachment: ${filename}`);
      } catch (err) {
        console.error(`Error saving attachment ${filename}:`, err);
      }
    }
  }
  
  async sendEmail(options) {
    if (!this.smtpTransporter) {
      throw new Error('SMTP transporter not initialized');
    }
    
    const mailOptions = {
      from: options.from || this.config.emailAddress,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject || '',
      text: options.text || '',
      html: options.html || '',
      inReplyTo: options.inReplyTo,
      references: options.references,
      attachments: options.attachments || [],
    };
    
    try {
      const info = await this.smtpTransporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  
  async send(options) {
    // Alias for sendEmail for consistency with other channels
    return this.sendEmail(options);
  }
  
  async disconnect() {
    // Exit IDLE mode if active
    if (this.imapClient && this.imapClient._idle && this.imapClient._idle.stopped === false) {
      console.log('Exiting IMAP IDLE mode...');
      this.imapClient.idleStop(() => {
        console.log('IMAP IDLE mode stopped');
      });
    }
    
    // Clear NOOP polling interval
    if (this.noopInterval) {
      clearInterval(this.noopInterval);
      this.noopInterval = null;
    }
    
    // Close IMAP connection
    if (this.imapClient) {
      this.imapClient.end();
    }
    
    // Close SMTP connection
    if (this.smtpTransporter) {
      this.smtpTransporter.close();
    }
    
    this.isConnected = false;
    console.log('Email channel disconnected');
  }
  
  // Method to handle OpenClaw message format
  async handleOpenClawMessage(message) {
    if (message.action === 'send') {
      return this.sendEmail({
        to: message.to,
        subject: message.subject || 'Message from OpenClaw',
        text: message.text || message.content || '',
        html: message.html,
        attachments: message.attachments,
        inReplyTo: message.inReplyTo,
        references: message.references,
      });
    }
    
    throw new Error(`Unsupported action: ${message.action}`);
  }
}

module.exports = EmailChannelPlugin;

// If run directly, start the plugin with config from environment
if (require.main === module) {
  const config = {
    imap: {
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT) || 993,
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      tls: process.env.IMAP_TLS !== 'false',
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      secure: process.env.SMTP_SECURE === 'true',
    },
    emailAddress: process.env.EMAIL_ADDRESS,
    markSeen: process.env.MARK_SEEN !== 'false',
    saveAttachments: process.env.SAVE_ATTACHMENTS === 'true',
    attachmentsDir: process.env.ATTACHMENTS_DIR,
  };
  
  const plugin = new EmailChannelPlugin(config);
  
  plugin.on('connected', () => {
    console.log('Email channel plugin ready');
  });
  
  plugin.on('message', (message) => {
    console.log('Received email:', message.data.subject);
    // Here you would forward to OpenClaw gateway
    // For example: send to WebSocket or HTTP endpoint
  });
  
  plugin.on('error', (err) => {
    console.error('Plugin error:', err);
  });
  
  plugin.connect().catch(console.error);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await plugin.disconnect();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('Terminating...');
    await plugin.disconnect();
    process.exit(0);
  });
}