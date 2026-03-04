# OpenClaw Email Channel Plugin

![OpenClaw](https://img.shields.io/badge/OpenClaw-Email%20Channel-blue)
![Node.js](https://img.shields.io/badge/Node.js-≥22.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Tests](https://github.com/aibot505/openclaw-email-channel/actions/workflows/test.yml/badge.svg)
![Release](https://img.shields.io/github/v/release/aibot505/openclaw-email-channel)

A robust email channel plugin for OpenClaw that enables sending and receiving emails as a first-class communication channel.

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/openclaw/openclaw-email-channel.git
cd openclaw-email-channel

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your email credentials

# Start the plugin
npm start
```

### OpenClaw Integration

Add to your OpenClaw config (`~/.openclaw/config.json`):

```json
{
  "channels": {
    "email": {
      "enabled": true,
      "type": "external",
      "command": "node",
      "args": ["/path/to/email-channel-plugin.js"],
      "env": {
        "IMAP_HOST": "imap.gmail.com",
        "IMAP_USER": "your-email@gmail.com",
        "IMAP_PASSWORD": "your-app-password",
        "SMTP_HOST": "smtp.gmail.com",
        "SMTP_USER": "your-email@gmail.com",
        "SMTP_PASSWORD": "your-app-password",
        "EMAIL_ADDRESS": "your-email@gmail.com"
      }
    }
  }
}
```

## 📋 Features

- ✅ **Real-time Email Monitoring** - IMAP integration with configurable polling
- ✅ **Email Sending** - SMTP support with attachments and HTML
- ✅ **Thread Support** - Proper email conversation threading
- ✅ **Attachment Handling** - Save and send attachments
- ✅ **Multiple Recipients** - TO, CC, BCC support
- ✅ **Error Handling** - Comprehensive error recovery and logging
- ✅ **Security** - TLS/SSL support and secure credential handling
- ✅ **Configurable** - Flexible configuration via environment variables

## 🛠️ Usage Examples

### Send an Email from OpenClaw Agent

```javascript
await message({
  action: "send",
  channel: "email",
  to: "recipient@example.com",
  subject: "Hello from OpenClaw",
  text: "This email was sent via OpenClaw email channel",
  html: "<p>This email was sent via <b>OpenClaw</b> email channel</p>"
});
```

### Send Email with Attachment

```javascript
await message({
  action: "send",
  channel: "email",
  to: "team@example.com",
  subject: "Monthly Report",
  text: "Please review the attached monthly report.",
  attachments: [
    {
      filename: "report-march.pdf",
      path: "/reports/march-2024.pdf"
    }
  ]
});
```

### Auto-respond to Incoming Emails

```javascript
// In your OpenClaw agent logic
if (message.channel === "email") {
  const email = message.data;
  
  if (email.subject.includes("support")) {
    await message({
      action: "send",
      channel: "email",
      to: email.from.address,
      subject: `Re: ${email.subject}`,
      text: "Thanks for contacting support. We'll get back to you soon!",
      inReplyTo: email.id
    });
  }
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_TLS=true

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false

# Plugin Settings
EMAIL_ADDRESS=your-email@gmail.com
POLL_INTERVAL=30000
MARK_SEEN=true
SAVE_ATTACHMENTS=false
ATTACHMENTS_DIR=./attachments
```

### Supported Email Providers

| Provider | IMAP Host | SMTP Host | Notes |
|----------|-----------|-----------|-------|
| Gmail | `imap.gmail.com` | `smtp.gmail.com` | Requires app password |
| Outlook/Office 365 | `outlook.office365.com` | `smtp.office365.com` | Modern auth may be needed |
| Yahoo | `imap.mail.yahoo.com` | `smtp.mail.yahoo.com` | App password required |
| iCloud | `imap.mail.me.com` | `smtp.mail.me.com` | App-specific password |
| ProtonMail | `127.0.0.1` | `127.0.0.1` | Requires bridge |

## 🚨 Security Notes

1. **Never commit credentials** - Use environment variables or secure config files
2. **Use app passwords** - For services like Gmail, generate app-specific passwords
3. **Enable 2FA** - Always enable two-factor authentication
4. **Regular audits** - Monitor logs and review sent/received emails
5. **Dedicated account** - Consider using a separate email account for the bot

## 🐛 Troubleshooting

### Common Issues

**Q: Authentication fails with Gmail**
**A**: Use an app password instead of your regular password. Enable 2FA and generate an app password.

**Q: Connection times out**
**A**: Check firewall settings and verify ports are open (993 for IMAP, 587 for SMTP).

**Q: Emails not sending**
**A**: Verify SMTP settings and check if your provider requires specific authentication methods.

**Q: Plugin crashes on startup**
**A**: Check all required environment variables are set and dependencies are installed.

### Debug Mode

Enable verbose logging:

```bash
DEBUG=* npm start
```

Or run with Node debug:

```bash
node --inspect email-channel-plugin.js
```

## 📚 API Reference

### Plugin Events

| Event | Description | Data |
|-------|-------------|------|
| `connected` | Plugin connected to email servers | - |
| `disconnected` | Plugin disconnected | - |
| `message` | New email received | Email object |
| `error` | Error occurred | Error object |
| `sent` | Email sent successfully | Send info |

### Email Object Structure

```javascript
{
  id: "message-id@example.com",
  from: { address: "sender@example.com", name: "John Doe" },
  to: [{ address: "recipient@example.com", name: "Jane Smith" }],
  subject: "Email Subject",
  text: "Plain text content",
  html: "<p>HTML content</p>",
  date: "2024-01-01T12:00:00.000Z",
  attachments: [],
  headers: {},
  inReplyTo: null,
  references: null
}
```

## 🚨 Release Rules

### **Golden Rule: Never Release Before CI Passes**
- ✅ **Always wait** for GitHub Actions CI to pass (green checkmark)
- ✅ **Never create releases** when tests are failing
- ✅ **Check CI status** before any version bump or tag

### **Pre-Release Checklist:**
1. **CI Status**: All workflows must pass (`Test` workflow especially)
2. **Tests**: All unit and integration tests passing
3. **Security**: `npm audit` shows no high/critical vulnerabilities
4. **Documentation**: README, CHANGELOG, and SKILL.md updated
5. **Version**: package.json version bumped appropriately

### **Enforcement:**
- GitHub Actions will block releases if CI fails
- Use `scripts/check-ci-before-release.sh` to validate before releasing
- Releases created while CI is failing will be reverted

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Report Bugs** - Open an issue with detailed reproduction steps
2. **Suggest Features** - Share your ideas for improvements
3. **Submit PRs** - Fix bugs or add features (include tests!)
4. **Improve Docs** - Help make the documentation better

### Development Setup

```bash
# Fork and clone
git clone https://github.com/your-username/openclaw-email-channel.git
cd openclaw-email-channel

# Install dependencies
npm install

# Create test configuration
cp .env.example .env.test

# Run tests
npm test

# Run linting
npm run lint
```

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenClaw](https://github.com/openclaw/openclaw) - The amazing platform this plugin extends
- [node-imap](https://github.com/mscdex/node-imap) - IMAP client library
- [Nodemailer](https://nodemailer.com/) - Email sending library
- [mailparser](https://github.com/nodemailer/mailparser) - Email parsing library

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/openclaw/openclaw-email-channel/issues)
- **Discord**: [Join OpenClaw Community](https://discord.gg/clawd)
- **Documentation**: [OpenClaw Docs](https://docs.openclaw.ai)

---

**Made with ❤️ for the OpenClaw Community**

If this plugin helps you, please consider:
- ⭐ Starring the repository
- 🐛 Reporting issues
- 🔧 Contributing improvements
- 📢 Sharing with others