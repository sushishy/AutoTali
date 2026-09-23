@echo off
setlocal

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
cd /d "%PROJECT_DIR%"

:: Clean up any stale port 8000 processes to prevent port conflict
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }" >nul 2>&1

:: Setup USB reverse port mapping for phone tethering
adb reverse tcp:8000 tcp:8000 >nul 2>&1

echo ========================================================================
echo                  AUTOTALLY SCANNER - TABBED LAUNCHER
echo ========================================================================
echo Launching services in Windows Terminal:
echo   [Tab 1] AutoTally Backend & Web Server (Port 8000)
echo   [Tab 2] Phone & Network Connection Monitor
echo ========================================================================
echo.

powershell -NoProfile -Command ^
  "$p = @('[=...] Initializing services in 3s...', '[==..] Configuring port in 2s...', '[===.] Spawning terminal tabs in 1s...'); " ^
  "for ($i=0; $i -lt 3; $i++) { Write-Host ('  ' + $p[$i]) -ForegroundColor White; Start-Sleep -Seconds 1 }"

:: Auto-open browser in background (grace period 2s)
start /b powershell -NoProfile -Command "Start-Sleep -Milliseconds 2000; Start-Process 'http://localhost:8000'"

:: Check if Windows Terminal (wt.exe) is available
where wt.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start wt -d "%PROJECT_DIR%" --title "AutoTally Server" cmd /k "python backend\run.py" ; new-tab -d "%PROJECT_DIR%" --title "Phone & Hotspot Info" cmd /k "powershell -NoProfile -Command \"Write-Host '==================================================' -ForegroundColor White; Write-Host '  AUTOTALLY CONNECTION MONITOR' -ForegroundColor White; Write-Host '==================================================' -ForegroundColor White; $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1).IPAddress; Write-Host ('  PC URL:    http://localhost:8000'); Write-Host ('  Phone URL: http://' + $ip + ':8000'); Write-Host '==================================================' -ForegroundColor White; Write-Host '  ADB USB Devices:'; adb devices; Write-Host '==================================================' -ForegroundColor White;\""
) else (
    start "AutoTally Server" cmd /k "python backend\run.py"
)

echo.
echo ========================================================================
echo   [SUCCESS] AutoTally Terminal Launched!
echo   Closing launcher in 1 second...
echo ========================================================================

powershell -NoProfile -Command "Start-Sleep -Seconds 1"
exit
