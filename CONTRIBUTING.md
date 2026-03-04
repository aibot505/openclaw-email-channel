# Contributing to OpenClaw Email Channel Plugin

Thank you for considering contributing to the OpenClaw Email Channel Plugin! This document provides guidelines and instructions for contributors.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## How Can I Contribute?

### Reporting Bugs
- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Include error messages and logs
- Specify your environment (OS, Node.js version, email provider)

### Suggesting Features
- Check if the feature has already been suggested
- Explain why this feature would be useful
- Provide examples of how the feature would work
- Consider if the feature aligns with the project's goals

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add or update tests if applicable
5. Update documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js 14 or higher
- npm or yarn
- Git

### Installation
```bash
# Fork and clone the repository
git clone https://github.com/vitalyster/openclaw-email-channel.git
cd openclaw-email-channel

# Install dependencies
npm install

# Create test configuration
cp .env.example .env.test
# Edit .env.test with test email credentials
```

### Running Tests
```bash
# Run unit tests
npm test

# Run integration tests (requires test email account)
npm run test:integration

# Run linting
npm run lint
```

## Coding Standards

### JavaScript Style
- Use ES6+ features where appropriate
- Follow Airbnb JavaScript Style Guide
- Use async/await for asynchronous code
- Add JSDoc comments for public functions

### Code Structure
- Keep functions small and focused
- Use meaningful variable and function names
- Add comments for complex logic
- Organize imports: built-in modules first, then third-party, then local

### Error Handling
- Use try/catch for async operations
- Provide meaningful error messages
- Log errors appropriately
- Don't swallow exceptions

## Documentation

### Updating Documentation
- Update README.md for user-facing changes
- Update SKILL.md for OpenClaw-specific documentation
- Add JSDoc comments for new functions
- Update examples if API changes

### Writing Examples
- Examples should be complete and runnable
- Include error handling in examples
- Show both basic and advanced usage
- Comment complex examples

## Testing

### Writing Tests
- Write tests for new features
- Update tests when fixing bugs
- Test edge cases and error conditions
- Mock external dependencies

### Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', async () => {
    // Test code
  });

  it('should handle errors', async () => {
    // Error test
  });
});
```

## Commit Messages

Use conventional commit messages:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add support for email threading`

## Review Process

1. Pull requests will be reviewed by maintainers
2. Address review comments promptly
3. Keep pull requests focused on a single change
4. Ensure all tests pass
5. Update documentation as needed

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a release tag
4. Publish to npm (if applicable)

## Questions?

- Open an issue for questions about contributing
- Join the OpenClaw Discord community
- Check existing documentation

Thank you for contributing! 🎉