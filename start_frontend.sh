#!/bin/bash

# AI Template Generation Engine - Frontend Startup Script

echo "🔧 AI Template Generation Engine - Frontend Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "✗ Node.js is not installed"
    echo "Please install Node.js 16 or higher from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "✗ Node.js version 16 or higher is required (current: $(node -v))"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "✗ npm is not installed"
    exit 1
fi

echo "✓ npm $(npm -v) detected"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "✗ package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "✗ Failed to install dependencies"
        exit 1
    fi
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✓ Backend is running"
else
    echo "⚠️  Backend is not running"
    echo "Please start the backend first by running: python start_backend.py"
    echo "Continuing anyway..."
fi

# Start React development server
echo ""
echo "🚀 Starting AI Template Generation Engine Frontend..."
echo "Frontend will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm start
