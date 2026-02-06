@echo off
echo ========================================
echo   GitHub 自动同步脚本 - Process Alarm
echo ========================================

:: 进入目录
cd /d %~dp0

:: 1. 添加并提交本地改动
git add .
set commit_msg=Auto-sync at %date% %time%
git commit -m "%commit_msg%"

:: 2. 先拉取远程内容（使用 --rebase 可以让提交历史更干净）
echo 正在拉取远程更新...
git pull origin main --rebase

:: 3. 再推送到 GitHub
echo 正在推送到 GitHub...
git push origin main

echo.
echo ========================================
echo   同步完成！
echo ========================================
pause