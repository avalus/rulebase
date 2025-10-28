@echo off
echo 🚀 GitHub Workflow Local Testing
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found in PATH
    echo.
    echo 💡 To install Node.js:
    echo    1. Download from https://nodejs.org/
    echo    2. Install and restart your terminal
    echo    3. Run this script again
    echo.
    echo 🔄 Alternative: Use GitHub Actions for testing
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo ✅ Running local workflow test...
echo.
node test-workflow-locally.js

echo.
echo 🎉 Test completed!
echo.
echo 💡 Next steps:
echo    1. Review the test results above
echo    2. Push to GitHub to test with real data
echo    3. Check GitHub Actions tab for live results
echo.
pause