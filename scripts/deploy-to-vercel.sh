#!/bin/bash

# Exit on error
set -e

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide a commit message."
  echo "Usage: ./scripts/deploy-to-vercel.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"
REPO_URL="https://github.com/amir-eftekhar/speakercircle_web.git"

echo "🚀 Starting deployment to Vercel..."

# Check if Turso CLI is installed
if ! command -v turso &> /dev/null; then
  echo "⚠️  Turso CLI is not installed. This is recommended for database deployment."
  echo "   You can install it with: curl -sSfL https://get.tur.so/install.sh | bash"
  echo "   Then set up your database with: turso db create speakerscircle"
  echo "   For more details, see TURSO_DEPLOYMENT.md"
  read -p "Continue without Turso setup? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "✅ Turso CLI is installed."
  
  # Check if TURSO environment variables are set
  if [ -z "$TURSO_DATABASE_URL" ] || [ -z "$TURSO_AUTH_TOKEN" ]; then
    echo "⚠️  TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables are not set."
    echo "   These are needed to export your database to Turso."
    echo "   For more details, see TURSO_DEPLOYMENT.md"
    read -p "Continue without exporting to Turso? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  else
    echo "✅ Turso environment variables are set."
    echo "🔄 Exporting database to Turso..."
    npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/export-to-turso-simple.ts || {
      echo "⚠️  Failed to export database to Turso. Continuing anyway..."
    }
  fi
fi

# Step 1: Build the project for Vercel
echo "🏗️  Building the project for Vercel..."
npm run build-for-vercel

# Check if the repository is already set up
if ! git remote -v | grep -q "origin.*speakercircle_web"; then
  echo "🔄 Setting up the correct repository..."
  # Check if git is initialized
  if [ ! -d .git ]; then
    echo "📁 Initializing git repository..."
    git init
  fi
  
  # Set or update the remote URL
  if git remote | grep -q "origin"; then
    echo "🔄 Updating remote URL to $REPO_URL"
    git remote set-url origin $REPO_URL
  else
    echo "➕ Adding remote origin as $REPO_URL"
    git remote add origin $REPO_URL
  fi
  
  # Ensure we're on the main branch
  echo "🔄 Ensuring we're on the main branch..."
  git branch -M main
fi

# Step 2: Add all changes to git
echo "📝 Adding changes to git..."
git add .

# Step 3: Commit changes
echo "💾 Committing changes with message: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

# Step 4: Push to the main branch
echo "📤 Pushing to main branch..."
git push -u origin main

# Step 5: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment process completed!"

# Remind about Vercel environment variables
echo ""
echo "🔑 IMPORTANT: Make sure to set these environment variables in your Vercel project:"
echo "   - NEXTAUTH_SECRET: A random string for session encryption"
echo "   - NEXTAUTH_URL: Your deployed app URL"
echo "   - NEXT_PUBLIC_APP_URL: Your deployed app URL"
echo "   - TURSO_DATABASE_URL: Your Turso database URL"
echo "   - TURSO_AUTH_TOKEN: Your Turso authentication token"
echo ""
echo "📚 For more details on Turso setup, see TURSO_DEPLOYMENT.md"
