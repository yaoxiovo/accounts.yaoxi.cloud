#!/bin/bash
# 一键推送本仓库到 GitHub (yaoxiovo)
echo "========================================="
echo " 推送仓库至 GitHub: yaoxiovo/accounts.yaoxi.cloud"
echo "========================================="

# 检查远程地址
git remote -v

# 若使用 HTTPS Token 推送:
# git push https://<YOUR_GITHUB_PAT_TOKEN>@github.com/yaoxiovo/accounts.yaoxi.cloud.git main

# 若使用 SSH 密钥推送:
# git remote set-url origin git@github.com:yaoxiovo/accounts.yaoxi.cloud.git
# git push -u origin main

git push -u origin main
