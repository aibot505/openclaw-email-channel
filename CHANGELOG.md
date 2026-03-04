# Changelog

All notable changes to the OpenClaw Email Channel Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2024-03-04

### Added
- IMAP IDLE support for real-time email notifications (no polling)
- Fallback to NOOP polling if IDLE fails or is disabled
- Keepalive configuration for maintaining IMAP connections
- Enhanced error handling for IMAP connection issues

### Changed
- **BREAKING**: Removed `POLL_INTERVAL` environment variable (replaced by IMAP IDLE)
- Updated IMAP configuration with keepalive settings
- Improved connection stability with automatic reconnection
- Updated documentation to reflect real-time email monitoring

### Fixed
- Potential memory leaks from polling intervals
- Connection timeout issues with long-running IMAP sessions
- Documentation inconsistencies regarding email monitoring

### Performance
- ⚡ **Significant improvement**: Eliminated constant polling
- 📉 **Reduced bandwidth**: Only check emails when notified by server
- 🔋 **Better resource usage**: Less CPU and network usage
- ⏱️ **Faster notifications**: Instant email delivery via IDLE

## [1.2.0] - 2024-03-04

### Added
- GitHub Actions workflow to enforce "no release before CI passes" rule
- Pre-release check script (`scripts/check-ci-before-release.sh`)
- Comprehensive test suite with unit and integration tests
- Internal release guide documentation
- Dynamic repository detection in CI check script

### Changed
- Updated all tests to work with Node.js 22+ (removed deprecated `mock.module`)
- Improved test structure and organization
- Enhanced error handling in tests
- Updated documentation structure (separated public/internal)

### Fixed
- Security vulnerabilities in dependencies (imap, nodemailer)
- Package.json and package-lock.json synchronization issues
- CI failures due to ES module compatibility with c8
- Test assertions for flexible documentation structure

### Security
- Updated `imap` from ^0.8.19 to ^0.8.17 (security fix)
- Updated `nodemailer` from ^6.9.7 to ^8.0.1 (security fix)
- All security vulnerabilities resolved (npm audit clean)

## [1.1.0] - 2024-03-04

### Added
- GitHub Actions workflow testing Node.js 22, 24, 25 matrix
- Comprehensive unit tests with proper mocking
- Integration tests for file structure and configuration
- Test coverage reporting with Codecov integration
- Test runner script with coverage support
- GitHub Actions badges to README

### Changed
- Updated Node.js engine requirement from >=14.0.0 to >=22.0.0
- Updated dev dependencies for Node.js 22 compatibility
- Improved test structure and organization
- Updated documentation with current requirements

### Fixed
- Test mocking for IMAP, SMTP, and mailparser dependencies
- Documentation inconsistencies
- Package.json repository URLs

## [1.0.0] - 2024-03-04

### Initial Release
- Complete email channel plugin for OpenClaw
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
- Support for major email providers (Gmail, Outlook, Yahoo, etc.)
- Production-ready with comprehensive documentation
- MIT License

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