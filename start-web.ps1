Write-Host "Starting Centscape Backend and Frontend (Web)..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Frontend will be available at: http://localhost:8081" -ForegroundColor Yellow
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
Write-Host "Starting frontend..." -ForegroundColor Green
npm --prefix frontend run web

# Clean up background job when done
Get-Job -Name "Backend" | Stop-Job
Get-Job -Name "Backend" | Remove-Job
