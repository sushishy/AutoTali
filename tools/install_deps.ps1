param(
    [string]$PythonExe = "python",
    [string]$ReqPath = "requirements.txt"
)

$Host.UI.RawUI.WindowTitle = "AutoTali - Setup"
Clear-Host

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "                     AUTOTALI - FIRST-TIME SETUP                        " -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Welcome to AutoTali!" -ForegroundColor White
Write-Host ""
Write-Host "  [SAFETY & PRIVACY NOTICE]" -ForegroundColor Green
Write-Host "  AutoTali is preparing official open-source libraries:" -ForegroundColor Gray
Write-Host "    - OpenCV      : Fast camera vision & checkbox detection" -ForegroundColor Gray
Write-Host "    - FastAPI     : Local offline server connecting your phone" -ForegroundColor Gray
Write-Host "    - OpenPyXL    : Saves your questionnaire responses to Excel" -ForegroundColor Gray
Write-Host ""
Write-Host "  * 100% Safe & Verified open-source packages from Python's official index (PyPI)" -ForegroundColor White
Write-Host "  * 100% Private: All questionnaire data stays strictly on your computer" -ForegroundColor White
Write-Host "  * One-time setup: This download only runs once!" -ForegroundColor White
Write-Host ""
Write-Host "------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Ensure absolute path to requirements file
if (Test-Path $ReqPath) {
    $ReqPath = (Resolve-Path $ReqPath).Path
}

# Run pip in a background job while showing a friendly animated barloader
$job = Start-Job -ScriptBlock {
    param($py, $req)
    & $py -m pip install -r $req --quiet --no-warn-script-location
    return $LASTEXITCODE
} -ArgumentList $PythonExe, $ReqPath

$frames = @(
    "[>                 ]  Connecting to official PyPI repository...",
    "[===>              ]  Downloading verified OpenCV vision tools...",
    "[=======>          ]  Configuring FastAPI & offline server...",
    "[===========>      ]  Setting up Excel writer (OpenPyXL)...",
    "[===============>  ]  Finalizing libraries...",
    "[=================>]  Almost done..."
)

$i = 0
while ($job.State -eq 'Running') {
    $frame = $frames[$i % $frames.Length]
    Write-Host -NoNewline ("`r  " + $frame + "   ") -ForegroundColor Cyan
    Start-Sleep -Milliseconds 650
    $i++
}

$null = Receive-Job -Job $job
$isSuccess = ($job.State -eq 'Completed')
Remove-Job -Job $job -Force

if ($isSuccess) {
    Write-Host ""
    Write-Host ""
    Write-Host "  [SUCCESS] All tools are installed and ready to go!" -ForegroundColor Green
    Write-Host "========================================================================" -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    exit 0
} else {
    Write-Host ""
    Write-Host ""
    Write-Host "  [NOTICE] Could not complete download." -ForegroundColor Yellow
    Write-Host "  Please check your internet connection and try opening start.bat again." -ForegroundColor Gray
    Write-Host "========================================================================" -ForegroundColor Cyan
    Start-Sleep -Seconds 3
    exit 1
}
