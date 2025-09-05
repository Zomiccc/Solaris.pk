#!/bin/bash

echo "🚀 Deploying Solaris Online Store to Glitch..."

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build React app
echo "🔨 Building React app..."
npm run build

echo "✅ Build complete! Ready for deployment."
echo ""
echo "📋 Next steps:"
echo "1. Go to https://glitch.com"
echo "2. Click 'New Project' → 'Import from GitHub'"
echo "3. Upload your project files"
echo "4. Glitch will automatically start your app!"
echo ""
echo "🔗 Your app will be available at: https://your-project-name.glitch.me"
