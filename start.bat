@echo off
setlocal
cd /d "%~dp0"

title AutoTali - Scanner Server and Phone Connection
cls

:: Colored Banner via PowerShell
powershell -NoProfile -Command "Write-Host '========================================================================' -ForegroundColor Cyan; Write-Host '       Automated Questionnaire Scanner and Tally System' -ForegroundColor White; Write-Host '                        sushisserver' -ForegroundColor Cyan; Write-Host '========================================================================' -ForegroundColor Cyan"
echo.

:: ========================================================================
:: 1. DETECT PYTHON EXECUTABLE
:: ========================================================================
echo [1/4] Detecting Python runtime environment...
set "PYTHON_EXE="

where python >nul 2>&1 && set "PYTHON_EXE=python"
if not defined PYTHON_EXE (
    where py.exe >nul 2>&1 && set "PYTHON_EXE=py"
)
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
    echo.
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
powershell -NoProfile -Command "Write-Host '      -> [OK] ' -NoNewline -ForegroundColor Green; Write-Host 'Python detected (%PYTHON_EXE%)'"
echo.

:: ========================================================================
:: 2. AUTO-INSTALL MISSING DEPENDENCIES
:: ========================================================================
echo [2/4] Verifying packages and dependencies...
"%PYTHON_EXE%" -c "import cv2, openpyxl, fastapi, uvicorn" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo       -^> Installing missing packages...
    powershell -NoProfile -ExecutionPolicy Bypass -File "tools\install_deps.ps1" -PythonExe "%PYTHON_EXE%" -ReqPath "requirements.txt"
    if %ERRORLEVEL% NEQ 0 (
        pause
        exit /b 1
    )
)
powershell -NoProfile -Command "Write-Host '      -> [OK] ' -NoNewline -ForegroundColor Green; Write-Host 'Core scanning and web server dependencies ready.'"
echo.

:: ========================================================================
:: 3. CLEAN UP PORT 8000 & SETUP PORT MAPPING (ADB)
:: ========================================================================
echo [3/4] Configuring port 8000 and USB reverse tethering (ADB)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }" >nul 2>&1
adb reverse tcp:8000 tcp:8000 >nul 2>&1
powershell -NoProfile -Command "Write-Host '      -> [OK] ' -NoNewline -ForegroundColor Green; Write-Host 'Network port and phone bridge configured.'"
echo.

:: ========================================================================
:: 4. CHECK FRONTEND BUILD BUNDLE
:: ========================================================================
echo [4/4] Verifying web application UI bundle...
if not exist "frontend\dist\index.html" (
    where npm >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo       -^> Building frontend bundle...
        call npm --prefix frontend run build >nul 2>&1
    )
)
powershell -NoProfile -Command "Write-Host '      -> [OK] ' -NoNewline -ForegroundColor Green; Write-Host 'Web UI bundle verified.'"
echo.

:: ========================================================================
:: 5. LAUNCH UNIFIED SERVER WITH LOADER
:: ========================================================================
echo ========================================================================
powershell -NoProfile -Command "$frames = @('|', '/', '-', '\'); Write-Host '   Starting Unified AutoTali Server ' -NoNewline -ForegroundColor Cyan; for ($i = 0; $i -lt 12; $i++) { Write-Host ($frames[$i %% 4] + [char]8) -NoNewline -ForegroundColor Yellow; Start-Sleep -Milliseconds 70 }; Write-Host '[READY]' -ForegroundColor Green"
echo ========================================================================
echo.

"%PYTHON_EXE%" "backend\run.py"

pause
