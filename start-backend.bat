@echo off
echo ========================================
echo    Starting Centscape Backend Server
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo 🔧 Starting backend server...
echo 📊 Server will be available at:
echo    • Localhost: http://localhost:3000
echo    • Network: Check console for IP address
echo.

REM Start the backend server
npm start

pause
