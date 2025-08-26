Write-Host "Starting Centscape Backend and Frontend (Android)..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Frontend will start Android development build" -ForegroundColor Yellow
Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Cyan
Write-Host "- Android Studio installed" -ForegroundColor White
Write-Host "- Android emulator running or device connected" -ForegroundColor White
Write-Host "- ADB (Android Debug Bridge) in your PATH" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both services" -ForegroundColor Cyan
Write-Host ""

# Start backend in background
Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm run start-backend 
} -Name "Backend"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting Android frontend..." -ForegroundColor Green
npm --prefix frontend run android

# Clean up background job when done
Get-Job -Name "Backend" | Stop-Job
Get-Job -Name "Backend" | Remove-Job
