@echo off
setlocal

:: ========================================================================
:: 1. AUTO-ELEVATE TO ADMINISTRATOR (Prompts UAC on click)
:: ========================================================================
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [AutoTali] Requesting Administrator privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

:: Ensure working directory is strictly this script's folder
cd /d "%~dp0"
set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

title AutoTali - Launcher

echo ========================================================================
echo                  AUTOTALI SCANNER - LAUNCHER
echo ========================================================================
echo.

:: ========================================================================
:: 2. DETECT PYTHON EXECUTABLE
:: ========================================================================
set "PYTHON_EXE="

:: Check PATH for python or py
where python >nul 2>&1 && set "PYTHON_EXE=python"
if not defined PYTHON_EXE (
    where py.exe >nul 2>&1 && set "PYTHON_EXE=py"
)

:: Check common default Windows install folders if not on PATH
if not defined PYTHON_EXE (
    for /d %%D in ("%LocalAppData%\Programs\Python\Python*") do (
        if exist "%%D\python.exe" set "PYTHON_EXE=%%D\python.exe"
    )
)
if not defined PYTHON_EXE (
    for /d %%D in ("C:\Program Files\Python*") do (
        if exist "%%D\python.exe" set "PYTHON_EXE=%%D\python.exe"
    )
)

if not defined PYTHON_EXE (
    echo ========================================================================
    echo  [ERROR] Python is not installed or could not be found!
    echo.
    echo  Please install Python 3.10+ from:
    echo  https://www.python.org/downloads/
    echo.
    echo  IMPORTANT: Remember to check the box:
    echo  [x] "Add Python to PATH" during installation.
    echo ========================================================================
    echo.
    pause
    exit /b 1
)

:: ========================================================================
:: 3. AUTO-INSTALL MISSING DEPENDENCIES (FIRST-TIME RUN)
:: ========================================================================
"%PYTHON_EXE%" -c "import cv2, openpyxl, fastapi, uvicorn" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%PROJECT_DIR%\tools\install_deps.ps1" -PythonExe "%PYTHON_EXE%" -ReqPath "%PROJECT_DIR%\requirements.txt"
    if %ERRORLEVEL% NEQ 0 (
        pause
        exit /b 1
    )
)

:: ========================================================================
:: 4. CLEAN UP PORT 8000 & SETUP PORT MAPPING
:: ========================================================================
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }" >nul 2>&1
adb reverse tcp:8000 tcp:8000 >nul 2>&1

:: ========================================================================
:: 5. LAUNCH AUTOTALI SERVER
:: ========================================================================
echo Starting AutoTali Server on http://localhost:8000 ...

:: Launch the server process
start "AutoTali Server" "%PYTHON_EXE%" "%PROJECT_DIR%\backend\run.py"

:: Launch Connection Monitor (shows local Wi-Fi IP for phone scanning)
if exist "%PROJECT_DIR%\tools\phone_monitor.ps1" (
    start "AutoTali Phone Monitor" powershell -NoProfile -ExecutionPolicy Bypass -File "%PROJECT_DIR%\tools\phone_monitor.ps1"
)

:: Wait 2 seconds for server to bind, then open the browser
powershell -NoProfile -Command "Start-Sleep -Milliseconds 2000; Start-Process 'http://localhost:8000'"

echo.
echo ========================================================================
echo   [SUCCESS] AutoTali is running!
echo   Browser opened at http://localhost:8000
echo   Keep the server window open while scanning.
echo ========================================================================
echo.
timeout /t 3 >nul
exit
