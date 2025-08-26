@echo off
echo ========================================
echo    Centscape Deep Link Testing Guide
echo ========================================
echo.

echo Your deep link format:
echo centscape://add?url=YOUR_PRODUCT_URL
echo.

echo Testing with ADB (if available):
echo.

REM Try to find ADB in common locations
set ADB_PATH=""

if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
    echo Found ADB at: %ADB_PATH%
    echo.
    echo Testing deep link...
    %ADB_PATH% shell am start -W -a android.intent.action.VIEW -d "centscape://add?url=https://www.amazon.com/dp/B08N5WRWNW" com.centscape.app
    echo.
) else (
    echo ADB not found in common location.
    echo Please run: %LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe shell am start -W -a android.intent.action.VIEW -d "centscape://add?url=https://www.amazon.com/dp/B08N5WRWNW" com.centscape.app
    echo.
)

echo Alternative Testing Methods:
echo 1. Browser Test:
echo    - Open Chrome/Firefox on your Android device
echo    - Type: centscape://add?url=https://www.amazon.com/dp/B08N5WRWNW
echo    - Press Enter
echo.

echo 2. In-App Test:
echo    - Open your Centscape app
echo    - Go to Config screen
echo    - Click "Test Deep Link" button
echo.

echo 3. External App Test:
echo    - Send yourself a message with the deep link
echo    - Click on it from WhatsApp, Email, etc.
echo.

echo 4. Manual Test URLs:
echo    centscape://add?url=https://www.amazon.com/dp/B08N5WRWNW
echo    centscape://add?url=https://www.amazon.com/dp/B0CHX3V6QY
echo    centscape://add?url=https://www.amazon.com/dp/B09G9HD6PD
echo.

echo Expected Behavior:
echo - App should open
echo - Navigate to add product screen
echo - Show product preview
echo - Ready to add to wishlist
echo.

echo If you see "unmatched route" screen:
echo - Check console logs for debugging info
echo - The catch-all route should redirect to addProduct
echo.

pause
