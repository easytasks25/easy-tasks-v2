#!/bin/bash

# easy-tasks Deployment Script
echo "🚀 Starting easy-tasks deployment..."

# Prüfe ob Git initialisiert ist
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: easy-tasks app"
fi

# Prüfe ob remote origin gesetzt ist
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/easy-tasks.git"
    echo "   git push -u origin main"
    exit 1
fi

# Committe alle Änderungen
echo "📝 Committing changes..."
git add .
git commit -m "Deploy: Update app for online testing" || echo "No changes to commit"

# Push zu GitHub
echo "⬆️  Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Sign in with GitHub"
echo "3. Click 'New Project'"
echo "4. Select your repository"
echo "5. Set environment variables:"
echo "   - NEXTAUTH_URL: https://your-project.vercel.app"
echo "   - NEXTAUTH_SECRET: your-secret-key"
echo "   - DEMO_MODE: true"
echo "6. Click 'Deploy'"
echo ""
echo "🎉 Your app will be available at: https://your-project.vercel.app"
