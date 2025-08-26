@echo off
echo Starting Centscape Backend and Frontend (Web)...
echo.
echo Backend will be available at: http://localhost:3000
echo Frontend will be available at: http://localhost:8081
echo.
echo Press Ctrl+C to stop both services
echo.

start "Backend Server" cmd /k "npm run start-backend"
timeout /t 3 /nobreak >nul
start "Frontend Web" cmd /k "npm --prefix frontend run web"

echo Both services are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8081
pause
