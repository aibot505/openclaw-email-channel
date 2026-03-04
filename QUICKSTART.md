# OpenClaw Email Channel - Quick Start Guide

Get up and running with the email channel plugin in 5 minutes!

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Email Credentials
```bash
cp .env.example .env
# Edit .env with your email settings
```

### Step 3: Test the Plugin
```bash
node test-email.js
```

### Step 4: Integrate with OpenClaw
Add to your OpenClaw config (`~/.openclaw/config.json`):
```json
{
  "channels": {
    "email": {
      "enabled": true,
      "type": "external",
      "command": "node",
      "args": ["/full/path/to/email-channel-plugin.js"]
    }
  }
}
```

## 📧 Common Email Provider Configurations

### Gmail
```bash
# .env file for Gmail
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password  # NOT your regular password!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_ADDRESS=your-email@gmail.com
```

**Important for Gmail**: You must use an "App Password", not your regular password:
1. Enable 2-factor authentication on your Google account
2. Generate an app password: https://myaccount.google.com/apppasswords
3. Use that 16-character password in the config

### Outlook/Office 365
```bash
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
```

### Yahoo Mail
```bash
IMAP_HOST=imap.mail.yahoo.com
IMAP_PORT=993
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

## 🔧 Basic Usage Examples

### Send an Email
```javascript
// From within an OpenClaw agent
await message({
  action: "send",
  channel: "email",
  to: "friend@example.com",
  subject: "Hello from OpenClaw!",
  text: "This email was sent via OpenClaw's email channel."
});
```

### Send with HTML
```javascript
await message({
  action: "send",
  channel: "email",
  to: "user@example.com",
  subject: "Welcome Email",
  text: "Welcome to our service!",
  html: "<h1>Welcome!</h1><p>Thanks for joining our service.</p>"
});
```

### Send with Attachment
```javascript
await message({
  action: "send",
  channel: "email",
  to: "team@example.com",
  subject: "Monthly Report",
  text: "Attached is the monthly report.",
  attachments: [
    {
      filename: "report.pdf",
      path: "/path/to/report.pdf"
    }
  ]
});
```

## 🐛 Quick Troubleshooting

### "Authentication failed" error
- **Gmail**: Use an app password, not your regular password
- **Other providers**: Check if IMAP/SMTP access is enabled in account settings
- **All**: Verify username/password are correct

### "Connection refused" error
- Check firewall settings
- Verify port numbers (993 for IMAP, 587 for SMTP)
- Test with `telnet host port` to check connectivity

### Plugin crashes on startup
- Check all required environment variables in `.env`
- Verify Node.js version is 14+
- Run with `DEBUG=* node email-channel-plugin.js` for details

### Emails not sending/receiving
- Check spam folder
- Verify email provider isn't blocking the connection
- Enable debug logging: `DEBUG=imap*,smtp*`

## 📞 Need Help?

1. **Check the logs**: `DEBUG=* node email-channel-plugin.js`
2. **Read the docs**: `README.md` and `SKILL.md`
3. **Test connection**: `node test-email.js`
4. **Ask for help**: Open an issue on GitHub

## 🎯 Next Steps

1. **Set up auto-responses**: Create rules for automatic email replies
2. **Integrate with other channels**: Forward important emails to Telegram/Discord
3. **Create email workflows**: Set up scheduled reports or notifications
4. **Monitor keywords**: Alert on specific email content
5. **Build email commands**: Allow controlling OpenClaw via email

## ⚡ Pro Tips

- Use a dedicated email account for the bot
- Set `POLL_INTERVAL=60000` for less frequent checks (saves bandwidth)
- Enable `SAVE_ATTACHMENTS=true` to automatically save files
- Use `MARK_SEEN=false` if you want to manually mark emails as read
- Consider using a mail server like Mailgun or SendGrid for production

---

**You're ready to go!** The email channel plugin will now monitor your inbox and allow OpenClaw to send/receive emails.

For advanced features and detailed documentation, see `SKILL.md`.