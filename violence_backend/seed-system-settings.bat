@echo off
echo ========================================
echo   Initializing System Settings
echo ========================================
echo.
echo Running database seed...
echo.

cd /d "%~dp0"
call npm run prisma:seed

echo.
echo ========================================
echo   System Settings Initialized!
echo ========================================
echo.
echo Next steps:
echo 1. Login as admin
echo 2. Go to System Settings page
echo 3. Verify real data is showing
echo 4. Make changes and save
echo.
pause
