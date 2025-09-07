#!/usr/bin/env python3
"""
Test script to verify AI Template Generation Engine installation
"""

import sys
import os
import importlib
from pathlib import Path

def test_python_version():
    assert sys.version_info >= (3, 12)

def test_dependencies():
    """Test required dependencies"""
    print("\nTesting dependencies...")
    dependencies = [
        'flask',
        'flask_cors',
        'google.generativeai',
        'PyPDF2',
        'openpyxl',
        'pptx',
        'docx',
        'PIL',
        'speech_recognition',
        'pydub',
        'cv2',
        'reportlab',
        'flask_socketio'
    ]
    
    missing = []
    for dep in dependencies:
        try:
            importlib.import_module(dep)
            print(f"✅ {dep} - OK")
        except ImportError:
            print(f"❌ {dep} - Missing")
            missing.append(dep)
    
    if missing:
        print(f"\n❌ Missing dependencies: {', '.join(missing)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies installed")
    return True

def test_directories():
    """Test required directories"""
    print("\nTesting directories...")
    directories = ['uploads', 'outputs']
    
    for directory in directories:
        if Path(directory).exists():
            print(f"✅ {directory}/ - OK")
        else:
            print(f"❌ {directory}/ - Missing")
            try:
                Path(directory).mkdir(exist_ok=True)
                print(f"✅ {directory}/ - Created")
            except Exception as e:
                print(f"❌ {directory}/ - Failed to create: {e}")
                return False
    
    return True

def test_env_file():
    """Test environment file"""
    print("\nTesting environment file...")
    env_file = Path('.env')
    
    if not env_file.exists():
        print("❌ .env file not found")
        print("Run: copy env.example .env  (Windows)")
        print("Run: cp env.example .env  (Linux/Mac)")
        return False
    
    with open('.env', 'r') as f:
        content = f.read()
        if 'GEMINI_API_KEY=your_gemini_api_key_here' in content:
            print("⚠️  .env file exists but API key not set")
            print("Please edit .env and add your Gemini API key")
            return False
    
    print("✅ .env file configured")
    return True

def test_imports():
    """Test application imports"""
    print("\nTesting application imports...")
    try:
        from services.multimodal_processor import MultimodalProcessor
        from services.template_engine import TemplateEngine
        from services.ai_service import AIService
        from services.output_generator import OutputGenerator
        print("✅ Service modules - OK")
    except ImportError as e:
        print(f"❌ Service modules - Failed: {e}")
        return False
    
    try:
        from app import app
        print("✅ Flask app - OK")
    except ImportError as e:
        print(f"❌ Flask app - Failed: {e}")
        return False
    
    return True

def test_basic_functionality():
    """Test basic functionality"""
    print("\nTesting basic functionality...")
    
    try:
        # Test template engine
        from services.template_engine import TemplateEngine
        engine = TemplateEngine()
        template = engine.get_default_template()
        print("✅ Template engine - OK")
    except Exception as e:
        print(f"❌ Template engine - Failed: {e}")
        return False
    
    try:
        # Test multimodal processor
        from services.multimodal_processor import MultimodalProcessor
        processor = MultimodalProcessor()
        print("✅ Multimodal processor - OK")
    except Exception as e:
        print(f"❌ Multimodal processor - Failed: {e}")
        return False
    
    return True

def main():
    """Main test function"""
    print("🧪 AI Template Generation Engine - Installation Test")
    print("=" * 60)
    
    tests = [
        test_python_version,
        test_dependencies,
        test_directories,
        test_env_file,
        test_imports,
        test_basic_functionality
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 60)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Installation is ready.")
        print("\nNext steps:")
        print("1. Start backend: python start_backend.py")
        print("2. Start frontend: npm start (or start_frontend.bat on Windows)")
        print("3. Open http://localhost:3000 in your browser")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
