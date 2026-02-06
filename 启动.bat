@echo off
setlocal enabledelayedexpansion

echo ==================================
echo   �������������ձ���ϵͳ
echo ==================================

REM 1. �л�Ŀ¼
cd /d "%~dp0"

REM 2. Ԥ������ɱ������ռ�õ�7264�˿�
echo ���ڼ�鲢���� 7264�˿�...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :7264 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM 3. ��黷��
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [����] δ��⵽ npm���밲װ Node.js �����ԡ�
    pause
    exit /b 1
)

REM 4. ��������
echo ������������������...
start "Process-Alarm-Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo ==================================
echo   ����ָ���ѷ�����
echo   ���ʵ�ַ��http://localhost:7264/
echo ==================================
timeout /t 5