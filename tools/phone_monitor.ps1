# AutoTali Connection Monitor Script
$Host.UI.RawUI.WindowTitle = "AutoTali - Network & Phone Connection"
Clear-Host

Write-Host "========================================================================" -ForegroundColor White
Write-Host "                  AUTOTALI CONNECTION & PHONE MONITOR                   " -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor White
Write-Host ""

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1).IPAddress

Write-Host "  [PC Local Access]    -->  http://localhost:8000" -ForegroundColor White
Write-Host "  [Phone Hotspot URL]  -->  http://$($ip):8000" -ForegroundColor White
Write-Host "  [Phone USB Cable]    -->  http://localhost:8000 (via adb reverse)" -ForegroundColor White
Write-Host ""
Write-Host "========================================================================" -ForegroundColor White
Write-Host "  CONNECTED USB PHONES (ADB):" -ForegroundColor White
adb devices
Write-Host "========================================================================" -ForegroundColor White
Write-Host ""
Write-Host "Keep this tab open while using AutoTali." -ForegroundColor DarkGray
Write-Host ""

while ($true) {
    Start-Sleep -Seconds 5
}
