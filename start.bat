@echo off
title AutoTally Scanner
cd /d "%~dp0"

echo ========================================================
echo        AutoTally Unified Web Scanner
echo ========================================================
echo.

:: Setup USB reverse port mapping silently
adb reverse tcp:8000 tcp:8000 >nul 2>&1

:: Run unified server in this same single window
python backend\run.py

