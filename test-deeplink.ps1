Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Centscape Deep Link Testing Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your deep link format:" -ForegroundColor Yellow
Write-Host "centscape://add?url=YOUR_PRODUCT_URL" -ForegroundColor Green
Write-Host ""

Write-Host "Testing Methods:" -ForegroundColor Yellow
Write-Host "1. Browser Test:" -ForegroundColor White
Write-Host "   - Open Chrome/Firefox on your Android device" -ForegroundColor Gray
Write-Host "   - Type: centscape://add?url=https://www.amazon.com/dp/B08N5WRWNW" -ForegroundColor Gray
Write-Host "   - Press Enter" -ForegroundColor Gray
Write-Host ""

Write-Host "2. In-App Test:" -ForegroundColor White
Write-Host "   - Open your Centscape app" -ForegroundColor Gray
Write-Host "   - Go to Config screen" -ForegroundColor Gray
Write-Host "   - Click 'Test Deep Link' button" -ForegroundColor Gray
Write-Host ""

Write-Host "3. External App Test:" -ForegroundColor White
Write-Host "   - Send yourself a message with the deep link" -ForegroundColor Gray
Write-Host "   - Click on it from WhatsApp, Email, etc." -ForegroundColor Gray
Write-Host ""

Write-Host "4. Manual Test URLs:" -ForegroundColor White
Write-Host "   centscape://add?url=https://www.amazon.com/dp/B08N5WRWNW" -ForegroundColor Green
Write-Host "   centscape://add?url=https://www.amazon.com/dp/B0CHX3V6QY" -ForegroundColor Green
Write-Host "   centscape://add?url=https://www.amazon.com/dp/B09G9HD6PD" -ForegroundColor Green
Write-Host ""

Write-Host "Expected Behavior:" -ForegroundColor Yellow
Write-Host "- App should open" -ForegroundColor Gray
Write-Host "- Navigate to add product screen" -ForegroundColor Gray
Write-Host "- Show product preview" -ForegroundColor Gray
Write-Host "- Ready to add to wishlist" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to continue"
