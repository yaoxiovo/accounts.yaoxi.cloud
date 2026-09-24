#!/bin/bash
# 每次推送前自动执行生产构建与门禁检查
echo "========================================="
echo " 正在触发全流程自动化构建 (node build.js)..."
echo "========================================="
node build.js || exit 1

echo "========================================="
echo " 推送仓库至 GitHub: yaoxiovo/accounts.yaoxi.cloud"
echo "========================================="

git add .
git commit -m "build: auto build and sync $(date '+%Y-%m-%d %H:%M:%S')" || true
git push -u origin main
