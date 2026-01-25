#!/bin/bash

echo "🧹 Clearing all caches..."

# Clear Vite cache
rm -rf node_modules/.vite
echo "✓ Cleared Vite cache"

# Clear dist folder
rm -rf dist
echo "✓ Cleared dist folder"

# Clear client dist
rm -rf client/dist
echo "✓ Cleared client dist"

# Update service worker cache version
echo "✓ Service worker cache updated to v2-cleanup"

echo ""
echo "✅ All caches cleared!"
echo ""
echo "Next steps:"
echo "1. Close ALL browser tabs with localhost"
echo "2. Open browser DevTools (F12)"
echo "3. Go to Application > Service Workers"
echo "4. Click 'Unregister' on any service workers"
echo "5. Go to Application > Storage > Clear site data"
echo "6. Close DevTools"
echo "7. Open: http://localhost:3002/"
echo ""
echo "Or use Incognito/Private mode: Cmd+Shift+N (Chrome) or Cmd+Shift+P (Firefox)"
