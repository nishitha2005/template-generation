#!/usr/bin/env python3
"""
Startup script for the AI Template Generation Engine backend
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version.split()[0]} detected")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import google.generativeai
        import PyPDF2
        import openpyxl
        from pptx import Presentation
        from docx import Document
        from PIL import Image
        print("✓ All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    env_file = Path('.env')
    if not env_file.exists():
        print("✗ .env file not found")
        print("Please copy env.example to .env and add your Gemini API key")
        return False
    
    with open('.env', 'r') as f:
        content = f.read()
        if 'GEMINI_API_KEY=your_gemini_api_key_here' in content:
            print("✗ Please set your Gemini API key in .env file")
            return False
    
    print("✓ .env file configured")
    return True

def create_directories():
    """Create necessary directories"""
    directories = ['uploads', 'outputs']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    print("✓ Required directories created")

def start_flask_app():
    """Start the Flask application"""
    print("\n🚀 Starting AI Template Generation Engine Backend...")
    print("Backend will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server\n")
    
    try:
        from app import app, socketio
        socketio.run(app, debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"✗ Error starting server: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    print("🔧 AI Template Generation Engine - Backend Setup")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check environment file
    if not check_env_file():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Start Flask app
    start_flask_app()

if __name__ == "__main__":
    main()
