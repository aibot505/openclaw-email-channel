#!/bin/bash

# Publish OpenClaw Email Channel Plugin to GitHub
# Run this script after authenticating with GitHub CLI

echo "📤 Publishing OpenClaw Email Channel Plugin to GitHub..."
echo "======================================================"

# Check if git is configured
if ! git config --get user.name > /dev/null 2>&1; then
    echo "⚠️  Git user.name not set. Setting to 'Vitaly Takmazov'..."
    git config --global user.name "Vitaly Takmazov"
fi

if ! git config --get user.email > /dev/null 2>&1; then
    echo "⚠️  Git user.email not set. Setting to your GitHub email..."
    echo "Please enter your GitHub email address:"
    read -r github_email
    git config --global user.email "$github_email"
fi

# Check GitHub CLI authentication
echo "🔐 Checking GitHub authentication..."
if ! gh auth status > /dev/null 2>&1; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Please authenticate first:"
    echo "1. Run: gh auth login"
    echo "2. Follow the prompts to log in with your vitalyster account"
    echo "3. Then run this script again"
    exit 1
fi

# Get authenticated username
github_user=$(gh api user | jq -r '.login' 2>/dev/null || echo "")
if [ -z "$github_user" ]; then
    echo "❌ Could not get GitHub username. Please check authentication."
    exit 1
fi

echo "✅ Authenticated as: $github_user"

if [ "$github_user" != "vitalyster" ]; then
    echo "⚠️  Warning: You are authenticated as '$github_user', not 'vitalyster'"
    echo "The repository will be created under '$github_user' account."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. Please authenticate with vitalyster account."
        exit 1
    fi
fi

# Create repository
echo "🚀 Creating GitHub repository..."
gh repo create openclaw-email-channel \
    --description "Email channel plugin for OpenClaw - Send and receive emails as a communication channel" \
    --public \
    --source=. \
    --remote=origin \
    --push

if [ $? -eq 0 ]; then
    echo "✅ Repository created and pushed successfully!"
    
    # Get repository URL
    repo_url=$(git remote get-url origin)
    echo ""
    echo "🎉 Repository published at: $repo_url"
    echo ""
    echo "📋 Next steps:"
    echo "1. Visit: https://github.com/$github_user/openclaw-email-channel"
    echo "2. Add repository topics: openclaw, email, channel, plugin, imap, smtp"
    echo "3. Create a release (v1.0.0)"
    echo "4. Share with the OpenClaw community!"
    echo ""
    echo "🔗 Quick links:"
    echo "   - Repository: https://github.com/$github_user/openclaw-email-channel"
    echo "   - Issues: https://github.com/$github_user/openclaw-email-channel/issues"
    echo "   - Actions: https://github.com/$github_user/openclaw-email-channel/actions"
else
    echo "❌ Failed to create repository. Possible reasons:"
    echo "   - Repository already exists"
    echo "   - Authentication issues"
    echo "   - Network problems"
    echo ""
    echo "💡 Try manually:"
    echo "   git remote add origin https://github.com/vitalyster/openclaw-email-channel.git"
    echo "   git push -u origin master"
fi