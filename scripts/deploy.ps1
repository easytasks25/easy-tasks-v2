# easy-tasks Deployment Script für Windows
Write-Host "🚀 Starting easy-tasks deployment..." -ForegroundColor Green

# Prüfe ob Git initialisiert ist
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit: easy-tasks app"
}

# Prüfe ob remote origin gesetzt ist
try {
    $origin = git remote get-url origin 2>$null
    if (-not $origin) {
        throw "No origin found"
    }
} catch {
    Write-Host "⚠️  No remote origin found. Please add your GitHub repository:" -ForegroundColor Red
    Write-Host "   git remote add origin https://github.com/yourusername/easy-tasks.git" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
    exit 1
}

# Committe alle Änderungen
Write-Host "📝 Committing changes..." -ForegroundColor Yellow
git add .
$commitResult = git commit -m "Deploy: Update app for online testing" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "No changes to commit" -ForegroundColor Gray
}

# Push zu GitHub
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Sign in with GitHub" -ForegroundColor White
Write-Host "3. Click 'New Project'" -ForegroundColor White
Write-Host "4. Select your repository" -ForegroundColor White
Write-Host "5. Set environment variables:" -ForegroundColor White
Write-Host "   - NEXTAUTH_URL: https://your-project.vercel.app" -ForegroundColor Gray
Write-Host "   - NEXTAUTH_SECRET: your-secret-key" -ForegroundColor Gray
Write-Host "   - DEMO_MODE: true" -ForegroundColor Gray
Write-Host "6. Click 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your app will be available at: https://your-project.vercel.app" -ForegroundColor Green
