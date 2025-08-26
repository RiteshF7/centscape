@echo off
echo Starting Centscape Backend and Frontend (Android)...
echo.
echo Backend will be available at: http://localhost:3000
echo Frontend will start Android development build
echo.
echo Make sure you have:
echo - Android Studio installed
echo - Android emulator running or device connected
echo - ADB (Android Debug Bridge) in your PATH
echo.
echo Press Ctrl+C to stop both services
echo.

start "Backend Server" cmd /k "npm run start-backend"
timeout /t 3 /nobreak >nul
start "Frontend Android" cmd /k "npm --prefix frontend run android"

echo Both services are starting...
echo Backend: http://localhost:3000
echo Android: Check the Android emulator/device
pause
