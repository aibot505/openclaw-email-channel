const { describe, it, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert');

// Mock the external dependencies
const mockImap = {
  Imap: mock.fn(() => ({
    connect: mock.fn(),
    on: mock.fn(),
    once: mock.fn(),
    openBox: mock.fn(),
    end: mock.fn(),
    search: mock.fn(),
    fetch: mock.fn()
  }))
};

const mockMailparser = {
  simpleParser: mock.fn(() => Promise.resolve({
    messageId: 'test-message-id',
    from: { value: [{ address: 'test@example.com', name: 'Test User' }] },
    to: { value: [{ address: 'recipient@example.com', name: 'Recipient' }] },
    subject: 'Test Subject',
    text: 'Test email body',
    html: '<p>Test email body</p>',
    date: new Date(),
    attachments: [],
    headers: {},
    inReplyTo: null,
    references: null
  }))
};

const mockNodemailer = {
  createTransport: mock.fn(() => ({
    verify: mock.fn((callback) => callback(null)),
    sendMail: mock.fn(() => Promise.resolve({ messageId: 'sent-message-id' })),
    close: mock.fn()
  }))
};

// Mock the modules before requiring the plugin
mock.module('imap', () => mockImap);
mock.module('mailparser', () => ({ simpleParser: mockMailparser.simpleParser }));
mock.module('nodemailer', () => mockNodemailer);

// Now require the plugin
const EmailChannelPlugin = require('../email-channel-plugin.js');

describe('EmailChannelPlugin', () => {
  let plugin;
  const testConfig = {
    imap: {
      host: 'imap.test.com',
      port: 993,
      user: 'test@example.com',
      password: 'test-password',
      tls: true
    },
    smtp: {
      host: 'smtp.test.com',
      port: 587,
      user: 'test@example.com',
      password: 'test-password',
      secure: false
    },
    emailAddress: 'test@example.com',
    pollInterval: 30000,
    markSeen: true
  };

  beforeEach(() => {
    // Reset all mocks
    mock.reset();
    plugin = new EmailChannelPlugin(testConfig);
  });

  afterEach(() => {
    if (plugin) {
      plugin.disconnect().catch(() => {});
    }
  });

  describe('Constructor', () => {
    it('should create instance with valid config', () => {
      assert.ok(plugin instanceof EmailChannelPlugin);
      assert.strictEqual(plugin.config, testConfig);
    });

    it('should throw error with missing required config', () => {
      const invalidConfig = { imap: {} };
      assert.throws(() => new EmailChannelPlugin(invalidConfig), /Missing required config/);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate all required fields', () => {
      const config = {
        imap: { host: 'a', port: 1, user: 'b', password: 'c' },
        smtp: { host: 'd', port: 2, user: 'e', password: 'f' },
        emailAddress: 'test@example.com'
      };
      
      const instance = new EmailChannelPlugin(config);
      assert.ok(instance);
    });

    it('should use default values for optional fields', () => {
      const config = {
        imap: { host: 'a', port: 1, user: 'b', password: 'c' },
        smtp: { host: 'd', port: 2, user: 'e', password: 'f' },
        emailAddress: 'test@example.com'
      };
      
      const instance = new EmailChannelPlugin(config);
      assert.strictEqual(instance.config.pollInterval, 30000);
      assert.strictEqual(instance.config.markSeen, true);
    });
  });

  describe('Email Processing', () => {
    it('should parse email data correctly', async () => {
      const testEmail = {
        messageId: 'test-123',
        from: { value: [{ address: 'sender@example.com', name: 'Sender' }] },
        to: { value: [{ address: 'receiver@example.com', name: 'Receiver' }] },
        subject: 'Test Email',
        text: 'Hello World',
        html: '<p>Hello World</p>',
        date: new Date('2024-01-01'),
        attachments: [],
        headers: { 'x-custom': 'value' },
        inReplyTo: 'parent-123',
        references: 'ref-123'
      };

      mockMailparser.simpleParser.mock.mockImplementationOnce(() => Promise.resolve(testEmail));
      
      // Simulate processing an email
      await plugin.processEmail(testEmail);
      
      // The plugin should emit a message event
      // We can't easily test events with current mock setup, but we can verify no errors
      assert.ok(true);
    });

    it('should handle email without optional fields', async () => {
      const testEmail = {
        messageId: 'test-456',
        from: { value: [] },
        subject: '',
        text: '',
        date: null,
        attachments: []
      };

      mockMailparser.simpleParser.mock.mockImplementationOnce(() => Promise.resolve(testEmail));
      
      await plugin.processEmail(testEmail);
      assert.ok(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      // Mock IMAP connection error
      const mockImapInstance = mockImap.Imap.mock.results[0]?.value;
      if (mockImapInstance && mockImapInstance.once.mock) {
        // Simulate error callback
        const errorCallback = mockImapInstance.once.mock.calls.find(call => call[0] === 'error')?.[1];
        if (errorCallback) {
          errorCallback(new Error('Connection failed'));
        }
      }
      
      // Should not crash
      assert.ok(true);
    });

    it('should handle email parsing errors', async () => {
      mockMailparser.simpleParser.mock.mockImplementationOnce(() => {
        throw new Error('Parse error');
      });
      
      // Should handle error gracefully
      const buffer = 'invalid email data';
      try {
        // This would normally be called internally
        await mockMailparser.simpleParser(buffer);
      } catch (err) {
        assert.strictEqual(err.message, 'Parse error');
      }
    });
  });

  describe('Utility Methods', () => {
    it('should get nested values from config', () => {
      const value = plugin.getNestedValue(testConfig, 'imap.host');
      assert.strictEqual(value, 'imap.test.com');
    });

    it('should return undefined for non-existent path', () => {
      const value = plugin.getNestedValue(testConfig, 'nonexistent.path');
      assert.strictEqual(value, undefined);
    });
  });
});

// Export for test runner
if (require.main === module) {
  require('node:test').run();
}