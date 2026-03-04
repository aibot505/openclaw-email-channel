#!/bin/bash

# CI Check Before Release Script
# This script ensures CI passes before allowing a release

set -e

echo "🔍 Checking CI status before release..."
echo "======================================"

# Get repository info
REPO_OWNER="aibot505"
REPO_NAME="openclaw-email-channel"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    echo "   Visit: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Please run: gh auth login"
    exit 1
fi

# Get latest CI run status
echo "📊 Checking latest CI run for $REPO_OWNER/$REPO_NAME..."
LATEST_RUN=$(gh run list --repo "$REPO_OWNER/$REPO_NAME" --limit 1 --json conclusion,status,workflowName,url --jq '.[0]')

if [ -z "$LATEST_RUN" ] || [ "$LATEST_RUN" = "null" ]; then
    echo "⚠️  No CI runs found. Make sure GitHub Actions is enabled."
    exit 1
fi

STATUS=$(echo "$LATEST_RUN" | jq -r '.status')
CONCLUSION=$(echo "$LATEST_RUN" | jq -r '.conclusion')
WORKFLOW=$(echo "$LATEST_RUN" | jq -r '.workflowName')
URL=$(echo "$LATEST_RUN" | jq -r '.url')

echo "   Workflow: $WORKFLOW"
echo "   Status: $STATUS"
echo "   Conclusion: $CONCLUSION"
echo "   URL: $URL"

# Check if CI is still running
if [ "$STATUS" != "completed" ]; then
    echo "⏳ CI is still running. Wait for it to complete before releasing."
    exit 1
fi

# Check if CI passed
if [ "$CONCLUSION" != "success" ]; then
    echo "❌ CI FAILED! Do not release until CI passes."
    echo ""
    echo "📋 Steps to fix:"
    echo "1. Check the failed run: $URL"
    echo "2. Fix the issues causing CI to fail"
    echo "3. Push your fixes"
    echo "4. Wait for CI to pass"
    echo "5. Run this check again"
    echo ""
    echo "💡 Common issues:"
    echo "   - Tests failing"
    echo "   - Linting errors"
    echo "   - Dependency issues"
    echo "   - Syntax errors"
    exit 1
fi

echo "✅ CI passed successfully! It's safe to create a release."
echo ""
echo "🚀 Recommended release steps:"
echo "1. Update CHANGELOG.md"
echo "2. Update version in package.json"
echo "3. Commit changes with message: 'chore: release vX.Y.Z'"
echo "4. Create tag: git tag -a vX.Y.Z -m 'Release vX.Y.Z'"
echo "5. Push tag: git push origin vX.Y.Z"
echo "6. Create GitHub release: gh release create vX.Y.Z --title 'vX.Y.Z' --notes-file CHANGELOG.md"
echo ""
echo "📦 Optional: Publish to npm (if applicable)"
echo "   npm publish --access public"

exit 0