@echo off
echo ========================================
echo   GitHub 一键上传脚本 - Process Alarm
echo ========================================

:: 1. 进入当前目录
cd /d %~dp0

:: 2. 检查是否有新的更改
git add .

:: 3. 获取当前时间作为提交信息
set commit_msg=Auto-upload at %date% %time%

:: 4. 提交
git commit -m "%commit_msg%"

:: 5. 推送到 GitHub
echo.
echo 正在推送到 GitHub...
git push origin main

echo.
echo ========================================
echo   上传完成！按任意键退出。
echo ========================================
pause