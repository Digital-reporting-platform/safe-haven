@echo off
echo.
echo Pre-Deployment Checklist for Vercel
echo ======================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Run this script from violence_frontend directory.
    exit /b 1
)

echo [OK] In correct directory
echo.

REM Check for required files
echo Checking required files...
set "files_ok=1"

if exist "package.json" (
    echo   [OK] package.json exists
) else (
    echo   [ERROR] package.json missing
    set "files_ok=0"
)

if exist "vite.config.ts" (
    echo   [OK] vite.config.ts exists
) else (
    echo   [ERROR] vite.config.ts missing
    set "files_ok=0"
)

if exist "index.html" (
    echo   [OK] index.html exists
) else (
    echo   [ERROR] index.html missing
    set "files_ok=0"
)

if exist "vercel.json" (
    echo   [OK] vercel.json exists
) else (
    echo   [ERROR] vercel.json missing
    set "files_ok=0"
)

if "%files_ok%"=="0" (
    echo.
    echo Some required files are missing!
    exit /b 1
)
echo.

REM Check environment variables
echo Checking environment variables...
if exist ".env.production" (
    echo   [OK] .env.production exists
    findstr /C:"VITE_SUPABASE_URL" .env.production >nul && (
        echo   [OK] VITE_SUPABASE_URL is defined
    ) || (
        echo   [WARNING] VITE_SUPABASE_URL is missing
    )
    findstr /C:"VITE_SUPABASE_ANON_KEY" .env.production >nul && (
        echo   [OK] VITE_SUPABASE_ANON_KEY is defined
    ) || (
        echo   [WARNING] VITE_SUPABASE_ANON_KEY is missing
    )
    findstr /C:"VITE_API_URL" .env.production >nul && (
        echo   [OK] VITE_API_URL is defined
    ) || (
        echo   [WARNING] VITE_API_URL is missing
    )
) else (
    echo   [WARNING] .env.production not found
)
echo.

REM Check if node_modules exists
echo Checking dependencies...
if exist "node_modules" (
    echo   [OK] node_modules exists
) else (
    echo   [WARNING] node_modules not found. Run 'npm install' first.
)
echo.

REM Try to build the project
echo Testing build process...
echo   Running: npm run build
echo.

call npm run build
if %ERRORLEVEL% EQU 0 (
    echo.
    echo   [OK] Build successful!
    echo.
    
    if exist "dist" (
        echo   [OK] dist directory created
        echo   Build output created in dist/
        dir dist
    )
) else (
    echo.
    echo   [ERROR] Build failed! Fix errors before deploying.
    exit /b 1
)

echo.
echo ======================================
echo [OK] Pre-deployment checks complete!
echo.
echo Next steps:
echo 1. Review the VERCEL_DEPLOYMENT.md guide
echo 2. Push your code to Git
echo 3. Import project to Vercel
echo 4. Configure environment variables
echo 5. Deploy!
echo.
echo Or use Vercel CLI:
echo   vercel --prod
echo.
pause
