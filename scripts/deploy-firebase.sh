#!/bin/bash

# Firebase Deployment Script
# Deploy naar Firebase Hosting + Functions

set -e

echo "🚀 Firebase Deployment Script"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
pnpm run build

# Build functions
echo "⚙️  Building functions..."
cd functions
npm run build
cd ..

# Deploy
echo "🚀 Deploying to Firebase..."
firebase deploy

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://$(firebase projects:list | grep -o '[^ ]*\.web\.app' | head -1)"
