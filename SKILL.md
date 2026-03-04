# Email Channel Plugin for OpenClaw

This plugin enables OpenClaw to send and receive emails as a communication channel, similar to Telegram or Discord channels.

## Features

- **IMAP Integration**: Monitor email inbox for new messages in real-time
- **SMTP Integration**: Send emails with attachments and HTML support
- **Thread Support**: Handle email conversations with proper threading (in-reply-to, references)
- **Attachment Handling**: Process and save email attachments
- **IMAP IDLE Support**: Real-time email notifications using IMAP IDLE (no polling)
- **Multiple Recipients**: Support for TO, CC, and BCC fields
- **HTML/Text Emails**: Send both plain text and HTML formatted emails
- **Error Handling**: Comprehensive error handling and logging

## Installation

### Method 1: Direct Installation

1. **Ensure Node.js 22 or higher** is installed:
   ```bash
   node --version  # Should be 22.x or higher
   ```

2. Install dependencies:
   ```bash
   npm install imap mailparser nodemailer
   ```

3. Configure environment variables (see Configuration section)

4. Run the plugin:
   ```bash
   node email-channel-plugin.js
   ```

### Method 2: OpenClaw Integration

Add to your OpenClaw configuration file (`~/.openclaw/config.json`):

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
        "IMAP_PORT": "993",
        "IMAP_USER": "your-email@gmail.com",
        "IMAP_PASSWORD": "your-app-password",
        "SMTP_HOST": "smtp.gmail.com",
        "SMTP_PORT": "587",
        "SMTP_USER": "your-email@gmail.com",
        "SMTP_PASSWORD": "your-app-password",
        "EMAIL_ADDRESS": "your-email@gmail.com",
        "MARK_SEEN": "true",
        "SAVE_ATTACHMENTS": "false",
        "ATTACHMENTS_DIR": "./attachments",
        "IMAP_KEEPALIVE_INTERVAL": "300000",
        "IMAP_IDLE_INTERVAL": "60000",
        "IMAP_FORCE_NOOP": "true"
      }
    }
  }
}
```

## Configuration

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `IMAP_HOST` | IMAP server hostname | - | `imap.gmail.com` |
| `IMAP_PORT` | IMAP server port | `993` | `993` |
| `IMAP_USER` | Email username | - | `your-email@gmail.com` |
| `IMAP_PASSWORD` | Email password/app password | - | `your-app-password` |
| `IMAP_TLS` | Use TLS for IMAP | `true` | `true` |
| `SMTP_HOST` | SMTP server hostname | - | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` | `587` |
| `SMTP_USER` | SMTP username | - | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password/app password | - | `your-app-password` |
| `SMTP_SECURE` | Use SSL/TLS for SMTP | `false` | `false` |
| `EMAIL_ADDRESS` | Sender email address | - | `your-email@gmail.com` |
| `MARK_SEEN` | Mark emails as read | `true` | `true` |
| `SAVE_ATTACHMENTS` | Save attachments to disk | `false` | `true` |
| `ATTACHMENTS_DIR` | Directory for attachments | `./attachments` | `/tmp/email-attachments` |
| `IMAP_KEEPALIVE_INTERVAL` | Keepalive interval in ms (NOOP) | `300000` | `300000` |
| `IMAP_IDLE_INTERVAL` | IDLE timeout in ms | `60000` | `60000` |
| `IMAP_FORCE_NOOP` | Force NOOP instead of IDLE | `true` | `true` |

### Email Provider Examples

#### Gmail
```bash
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password  # Use app password, not regular password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_ADDRESS=your-email@gmail.com
# IMAP IDLE settings for real-time notifications
IMAP_KEEPALIVE_INTERVAL=300000
IMAP_IDLE_INTERVAL=60000
IMAP_FORCE_NOOP=true
```

#### Outlook/Office 365
```bash
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
```

#### Yahoo Mail
```bash
IMAP_HOST=imap.mail.yahoo.com
IMAP_PORT=993
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

## Usage

### Receiving Emails

The plugin automatically monitors your inbox and forwards emails to OpenClaw as messages with `channel: "email"`.

Example received message format:
```json
{
  "channel": "email",
  "type": "email",
  "data": {
    "id": "message-id@example.com",
    "from": {
      "address": "sender@example.com",
      "name": "John Doe"
    },
    "to": [
      {
        "address": "recipient@example.com",
        "name": "Jane Smith"
      }
    ],
    "subject": "Test Email",
    "text": "Hello, this is a test email.",
    "html": "<p>Hello, this is a test email.</p>",
    "date": "2026-01-01T12:00:00.000Z",
    "attachments": [],
    "headers": {},
    "inReplyTo": null,
    "references": null
  }
}
```

### Sending Emails

From within an OpenClaw agent session:

#### Basic Email
```javascript
await message({
  action: "send",
  channel: "email",
  to: "recipient@example.com",
  subject: "Hello from OpenClaw",
  text: "This is a test email sent via OpenClaw",
  html: "<p>This is a test email sent via <b>OpenClaw</b></p>"
});
```

#### Email with Multiple Recipients
```javascript
await message({
  action: "send",
  channel: "email",
  to: "primary@example.com",
  cc: ["cc1@example.com", "cc2@example.com"],
  bcc: "bcc@example.com",
  subject: "Meeting Notes",
  text: "Here are the meeting notes from today."
});
```

#### Email with Attachments
```javascript
await message({
  action: "send",
  channel: "email",
  to: "recipient@example.com",
  subject: "Report with attachment",
  text: "Please find the report attached.",
  attachments: [
    {
      filename: "report.pdf",
      path: "/path/to/report.pdf"
    },
    {
      filename: "data.csv",
      content: "name,age\nJohn,30\nJane,25"
    }
  ]
});
```

#### Reply to Email Thread
```javascript
await message({
  action: "send",
  channel: "email",
  to: "sender@example.com",
  subject: "Re: Previous conversation",
  text: "Here's my response to your email.",
  inReplyTo: "<original-message-id@example.com>",
  references: "<original-message-id@example.com> <other-message-id@example.com>"
});
```

## Integration Examples

### 1. Email-based Chatbot
```javascript
// Auto-respond to help requests
if (message.channel === "email" && message.data.text.includes("help")) {
  await message({
    action: "send",
    channel: "email",
    to: message.data.from.address,
    subject: `Re: ${message.data.subject}`,
    text: "Thanks for your message! Here's how I can help...",
    inReplyTo: message.data.id
  });
}
```

### 2. Email Notification System
```javascript
// Send system notifications via email
async function sendEmailAlert(alert) {
  await message({
    action: "send",
    channel: "email",
    to: "admin@example.com",
    subject: `ALERT: ${alert.type}`,
    text: `Alert detected: ${alert.message}\nTime: ${new Date().toISOString()}`,
    html: `<h2>Alert: ${alert.type}</h2><p>${alert.message}</p><p>Time: ${new Date().toISOString()}</p>`
  });
}
```

### 3. Cross-Channel Bridge
```javascript
// Forward important emails to Telegram
if (message.channel === "email" && message.data.subject.includes("URGENT")) {
  await message({
    action: "send",
    channel: "telegram",
    to: "chat:123456789",
    text: `📧 URGENT Email from ${message.data.from.address}:\n\nSubject: ${message.data.subject}\n\n${message.data.text.substring(0, 200)}...`
  });
}
```

## Security Considerations

1. **Use App Passwords**: For Gmail/Google accounts, use app-specific passwords instead of your main password
2. **Enable 2FA**: Always enable two-factor authentication on your email account
3. **Secure Storage**: Store credentials in environment variables or secure configuration files
4. **Limit Access**: Use a dedicated email account for the bot if possible
5. **Regular Audits**: Monitor logs and audit email activity regularly
6. **Attachment Scanning**: Consider scanning attachments for malware if saving to disk

## Troubleshooting

### Common Issues

#### Authentication Failed
- **Cause**: Incorrect password or username
- **Solution**: Verify credentials and use app passwords for services like Gmail
- **Debug**: Check if IMAP/SMTP access is enabled in your email account settings

#### Connection Refused
- **Cause**: Firewall blocking or wrong port
- **Solution**: Verify port numbers and firewall settings
- **Debug**: Test connection with `telnet host port`

#### Emails Not Sending
- **Cause**: SMTP configuration issues or sender restrictions
- **Solution**: Check SMTP settings and sender permissions
- **Debug**: Enable debug logging with `DEBUG=*`

#### Emails Not Being Received
- **Cause**: IMAP folder issues or spam filtering
- **Solution**: Check spam folder and IMAP folder permissions
- **Debug**: Verify IMAP connection with another client

### Debug Mode

Enable detailed logging:
```bash
DEBUG=* node email-channel-plugin.js
```

Or set specific debug categories:
```bash
DEBUG=imap*,smtp* node email-channel-plugin.js
```

### Log Files

Check OpenClaw logs:
```bash
openclaw logs --follow
```

Or check plugin logs (if configured to log to file):
```bash
tail -f /var/log/openclaw-email-channel.log
```

## Performance Tips

1. **Adjust Polling Interval**: Increase interval for less frequent checks (e.g., 60000ms for 1 minute)
2. **Limit Attachment Size**: Set maximum attachment size to prevent memory issues
3. **Use Connection Pooling**: For high-volume email, consider connection pooling
4. **Batch Processing**: Process emails in batches rather than one at a time
5. **Cache Frequently Used Data**: Cache email headers and metadata

## Development

### Building from Source

```bash
git clone https://github.com/aibot505/openclaw-email-channel.git
cd openclaw-email-channel
npm install
npm run build  # If TypeScript version exists
```

### Testing

```bash
# Run unit tests
npm test

# Run integration tests (requires test email account)
npm run test:integration
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/aibot505/openclaw-email-channel/issues)
- **Discord Community**: [Join OpenClaw Discord](https://discord.gg/clawd)
- **Documentation**: [OpenClaw Docs](https://docs.openclaw.ai)

## Changelog

### v1.0.0 (Initial Release)
- Basic IMAP/SMTP integration
- Email sending and receiving
- Attachment support
- Threading support
- Configurable polling

## Related Projects

- [OpenClaw](https://github.com/openclaw/openclaw) - Main OpenClaw project
- [Himalaya Skill](https://github.com/openclaw/skills/tree/main/himalaya) - CLI email management skill
- [OpenClaw Discord Channel](https://github.com/openclaw/openclaw/tree/main/src/channels/discord) - Discord channel implementation