# AI Template Generation Engine - Setup Guide

## Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Google Gemini API key

### 1. Backend Setup

#### Windows:
```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
copy env.example .env
# Edit .env and add your Gemini API key

# Create directories
mkdir uploads outputs

# Start backend
python start_backend.py
```

#### Linux/Mac:
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp env.example .env
# Edit .env and add your Gemini API key

# Create directories
mkdir uploads outputs

# Start backend
python start_backend.py
```

### 2. Frontend Setup

#### Windows:
```bash
# Install dependencies
npm install

# Start frontend
start_frontend.bat
```

#### Linux/Mac:
```bash
# Install dependencies
npm install

# Start frontend
./start_frontend.sh
```

### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Manual Setup (Alternative)

### Backend Manual Start
```bash
# Activate virtual environment
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Set environment variables
set GEMINI_API_KEY=your_api_key_here  # Windows
export GEMINI_API_KEY=your_api_key_here  # Linux/Mac

# Run Flask app
python app.py
```

### Frontend Manual Start
```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Testing the Application

### 1. Health Check
Visit http://localhost:5000/api/health to verify backend is running.

### 2. Upload Test Files
1. Go to http://localhost:3000/upload
2. Upload sample files (PDF, DOCX, etc.)
3. Verify files are processed successfully

### 3. Template Creation
1. Go to http://localhost:3000/template
2. Create or modify a template
3. Save the template

### 4. Content Generation
1. Go to http://localhost:3000/generate
2. Generate content based on uploaded files and template
3. Review the generated content

### 5. Export Testing
1. Go to http://localhost:3000/output
2. Export content in different formats (DOCX, PDF, PPTX)
3. Verify exported files

## Troubleshooting

### Common Issues

#### Backend Issues
- **Port 5000 already in use**: Change port in `app.py` or stop conflicting service
- **Missing dependencies**: Run `pip install -r requirements.txt`
- **API key error**: Check `.env` file and ensure Gemini API key is correct
- **Permission errors**: Ensure write permissions for `uploads/` and `outputs/` directories

#### Frontend Issues
- **Port 3000 already in use**: React will prompt to use a different port
- **Module not found**: Run `npm install`
- **Backend connection failed**: Ensure backend is running on port 5000

#### File Processing Issues
- **Large file uploads**: Check `MAX_CONTENT_LENGTH` setting
- **Unsupported file types**: Verify file extension is supported
- **Processing errors**: Check file format and size

### Debug Mode
Enable debug mode by setting `FLASK_DEBUG=True` in `.env` file.

### Logs
- Backend logs: Check console output
- Frontend logs: Check browser console (F12)

## Configuration

### Environment Variables
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
FLASK_ENV=development
FLASK_DEBUG=True
MAX_CONTENT_LENGTH=104857600
UPLOAD_FOLDER=uploads
OUTPUT_FOLDER=outputs
```

### File Size Limits
- Default maximum file size: 100MB
- Modify `MAX_CONTENT_LENGTH` in `.env` to change

### Supported File Types
- Documents: PDF, DOCX, PPTX
- Spreadsheets: XLSX, XLS
- Images: PNG, JPG, JPEG
- Audio: MP3, WAV, M4A
- Video: MP4, AVI, MOV

## Production Deployment

### Backend (Flask)
1. Set `FLASK_ENV=production` in `.env`
2. Use a production WSGI server (e.g., Gunicorn)
3. Configure reverse proxy (e.g., Nginx)
4. Set up SSL certificates

### Frontend (React)
1. Build production version: `npm run build`
2. Serve static files with a web server
3. Configure API endpoints for production backend

### Security Considerations
- Use environment variables for sensitive data
- Implement proper authentication
- Set up CORS policies
- Use HTTPS in production
- Implement rate limiting

## API Documentation

### Endpoints
- `GET /api/health` - Health check
- `POST /api/upload` - Upload files
- `GET /api/template` - Get template
- `PUT /api/template` - Update template
- `POST /api/generate` - Generate content
- `POST /api/refine` - Refine content
- `POST /api/export/<format>` - Export content

### Example API Usage
```bash
# Health check
curl http://localhost:5000/api/health

# Upload files
curl -X POST -F "files=@document.pdf" http://localhost:5000/api/upload

# Generate content
curl -X POST -H "Content-Type: application/json" \
  -d '{"session_id":"default","instructions":"Custom instructions"}' \
  http://localhost:5000/api/generate
```

## Support

For issues and questions:
1. Check this setup guide
2. Review the main README.md
3. Check console logs for errors
4. Open an issue in the repository

## Next Steps

After successful setup:
1. Explore the dashboard
2. Upload sample files
3. Create custom templates
4. Generate your first document
5. Experiment with different file types and formats
