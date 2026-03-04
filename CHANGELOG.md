# Changelog

All notable changes to the OpenClaw Email Channel Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of OpenClaw Email Channel Plugin
- IMAP integration for receiving emails
- SMTP integration for sending emails
- Attachment support for sending and receiving
- Email threading support (in-reply-to, references)
- Configurable polling interval
- Comprehensive error handling
- Environment-based configuration
- Test script for verification
- OpenClaw integration examples
- Documentation (README, SKILL.md, QUICKSTART)

### Features
- Real-time email monitoring
- HTML email support
- Multiple recipient support (TO, CC, BCC)
- Secure TLS/SSL connections
- Configurable attachment handling
- Graceful shutdown handling
- Debug logging support

### Security
- Secure credential handling via environment variables
- TLS/SSL support for IMAP and SMTP
- App password recommendations for services like Gmail

## [1.0.0] - 2024-03-04

### Initial Release
- Complete email channel plugin for OpenClaw
- Support for major email providers (Gmail, Outlook, Yahoo, etc.)
- Production-ready with comprehensive documentation
- MIT License

### Installation
```bash
npm install
# or
git clone https://github.com/vitalyster/openclaw-email-channel.git
```

### Usage
```javascript
// From OpenClaw agent
await message({
  action: "send",
  channel: "email",
  to: "recipient@example.com",
  subject: "Hello from OpenClaw",
  text: "Email sent via OpenClaw email channel"
});
```

### Configuration
- Environment variables for credentials
- Configurable polling intervals
- Attachment handling options
- Error recovery settings

### Documentation
- README.md - Project overview and installation
- SKILL.md - OpenClaw skill documentation
- QUICKSTART.md - 5-minute setup guide
- CONTRIBUTING.md - Contribution guidelines
- LICENSE - MIT License

### Dependencies
- imap ^0.8.19
- mailparser ^3.6.4
- nodemailer ^6.9.7

### Supported Platforms
- Node.js 14+
- Linux, macOS, Windows
- All major email providers with IMAP/SMTP support