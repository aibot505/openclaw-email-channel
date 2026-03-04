#!/bin/bash

# OpenClaw Email Channel Plugin Installer
# This script helps install and configure the email channel plugin

set -e

echo "📧 OpenClaw Email Channel Plugin Installer"
echo "=========================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version must be 14 or higher. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create configuration
echo "⚙️  Setting up configuration..."

if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    
    echo ""
    echo "⚠️  IMPORTANT: You need to edit the .env file with your email credentials."
    echo "   Open .env in a text editor and fill in your IMAP/SMTP settings."
    echo ""
    echo "   For Gmail users:"
    echo "   1. Enable 2-factor authentication"
    echo "   2. Generate an app password: https://myaccount.google.com/apppasswords"
    echo "   3. Use the app password in the IMAP_PASSWORD and SMTP_PASSWORD fields"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Make scripts executable
chmod +x email-channel-plugin.js test-email.js

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit the .env file with your email credentials"
echo "2. Test the plugin: node test-email.js"
echo "3. Integrate with OpenClaw by adding to your config.json"
echo ""
echo "Quick test command:"
echo "  node test-email.js"
echo ""
echo "OpenClaw integration example config:"
cat << 'EOF'
Add to ~/.openclaw/config.json:

{
  "channels": {
    "email": {
      "enabled": true,
      "type": "external",
      "command": "node",
      "args": ["/full/path/to/email-channel-plugin.js"],
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
EOF

echo ""
echo "📚 Documentation: See README.md for more details"
echo "🐛 Issues: https://github.com/openclaw/openclaw-email-channel/issues"