#!/bin/bash

# Firebase Emulators Start Script
# Dit script start alle Firebase emulators voor local development

echo "🔥 Starting Firebase Emulators..."
echo ""
echo "Emulator Ports:"
echo "  - Auth:      http://localhost:9099"
echo "  - Firestore: http://localhost:8080"
echo "  - Functions: http://localhost:5001"
echo "  - Storage:   http://localhost:9199"
echo "  - Hosting:   http://localhost:5002"
echo "  - UI:        http://localhost:4000"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not logged in to Firebase"
    echo "Run: firebase login"
    exit 1
fi

# Start emulators
firebase emulators:start
