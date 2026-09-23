@echo off
title AutoTally Web Scanner Launcher
echo ========================================================
echo        AutoTally Web Scanner (Offline & Hotspot)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Enabling ADB reverse port mapping for USB tethering...
adb reverse tcp:5173 tcp:5173 >nul 2>&1
adb reverse tcp:8000 tcp:8000 >nul 2>&1

echo [2/3] Starting Python FastAPI Backend on port 8000...
start "AutoTally Backend" cmd /k "python -m backend.run"

timeout /t 2 /nobreak >nul

echo [3/3] Starting React + Vite Frontend on port 5173...
cd frontend
start "AutoTally Frontend" cmd /k "npm run dev"

echo.
echo ========================================================
echo AutoTally is now running!
echo.
echo  PC Browser:      http://localhost:5173
echo  Phone (USB):     http://localhost:5173
echo  Phone (Hotspot): http://^<YOUR_LAPTOP_IP^>:5173
echo ========================================================
echo.
pause
