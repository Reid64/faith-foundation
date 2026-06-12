# FAITH Foundation - Deploy Script
Write-Host "=== FAITH Foundation Deploy ===" -ForegroundColor Cyan
Write-Host "Step 1: Type check..." -ForegroundColor Yellow
pnpm tsc --noEmit
if ($LASTEXITCODE -ne 0) { Write-Host "TYPE CHECK FAILED - ABORTING" -ForegroundColor Red; exit 1 }
Write-Host "Step 2: Build..." -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FAILED - ABORTING" -ForegroundColor Red; exit 1 }
Write-Host "Step 3: Deploy to Vercel..." -ForegroundColor Yellow
vercel --prod
if ($LASTEXITCODE -ne 0) { Write-Host "DEPLOY FAILED - ABORTING" -ForegroundColor Red; exit 1 }
Write-Host "Step 4: Git commit and push..." -ForegroundColor Yellow
git add .
git commit -m "Production deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push
Write-Host "=== DEPLOY COMPLETE ===" -ForegroundColor Green
