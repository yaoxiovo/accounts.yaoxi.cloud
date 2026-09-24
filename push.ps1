Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " 正在触发全流程自动化构建 (node build.js)..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
node build.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败，已中止推送！" -ForegroundColor Red
    exit 1
}

Write-Host "=========================================" -ForegroundColor Green
Write-Host " 推送仓库至 GitHub: yaoxiovo/accounts.yaoxi.cloud" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $env:PATH = "$env:PATH;C:\Users\Administrator\AppData\Local\GitHubDesktop\app-3.6.6\resources\app\git\cmd"
}

git add .
git commit -m "build: auto build and sync $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push -u origin main
