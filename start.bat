@echo off
title AutoTally Unified Web Scanner
echo ========================================================
echo        AutoTally Unified Web Scanner (Single Tab)
echo ========================================================
echo.

cd /d "%~dp0"

echo Setting up USB reverse port mapping (for zero-latency USB tethering)...
adb reverse tcp:8000 tcp:8000 >nul 2>&1

echo.
echo Launching unified server & opening single browser tab at http://localhost:8000...
python -m backend.run

pause
