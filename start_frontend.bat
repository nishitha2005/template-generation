@echo off
REM AI Template Generation Engine - Frontend Startup Script (Windows)

echo 🔧 AI Template Generation Engine - Frontend Setup
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js is not installed
    echo Please install Node.js 16 or higher from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js detected

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ npm is not installed
    pause
    exit /b 1
)

echo ✓ npm detected

REM Check if package.json exists
if not exist "package.json" (
    echo ✗ package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ✗ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies already installed
)

REM Check if backend is running
echo 🔍 Checking if backend is running...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend is running
) else (
    echo ⚠️  Backend is not running
    echo Please start the backend first by running: python start_backend.py
    echo Continuing anyway...
)

REM Start React development server
echo.
echo 🚀 Starting AI Template Generation Engine Frontend...
echo Frontend will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm start
