# AI-Powered Template Generation Engine

An intelligent system for generating consulting and strategic analysis documents using AI-powered content generation with multimodal input processing.

## Features

### Core Capabilities
- **Multimodal Input Processing**: Supports PDF, PPTX, DOCX, XLSX, images, audio, and video files
- **Dynamic Template Engine**: Conversational template creation and modification
- **AI-Powered Content Generation**: Uses Google Gemini API for intelligent content creation
- **Evidence-Backed Outputs**: Every statement linked to source materials with proper citations
- **Real-time Refinement**: Conversational content improvement and iteration
- **Multiple Output Formats**: Export to DOCX, PDF, and PPTX

### Key Features
- **Scope Clarification**: AI proactively asks questions to ensure completeness
- **Traceability & Transparency**: Clear mapping between sources and final content
- **Quality Analysis**: Automated content quality scoring and feedback
- **Real-time Updates**: Template changes reflected immediately
- **Professional Outputs**: Consultant-grade document generation

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: React with Tailwind CSS
- **AI Service**: Google Gemini API
- **File Processing**: PyPDF2, python-pptx, openpyxl, Pillow, speech_recognition
- **Output Generation**: python-docx, reportlab, python-pptx

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Clone the repository and navigate to the project directory
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env and add your Gemini API key
   ```

5. Create necessary directories:
   ```bash
   mkdir uploads outputs
   ```

6. Run the Flask backend:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the project root directory
2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### 1. Upload Source Files
- Navigate to the Upload Files page
- Drag and drop or select files (PDF, PPTX, DOCX, XLSX, images, audio, video)
- Files are automatically processed and content is extracted

### 2. Create/Edit Template
- Go to Template Editor
- Define document structure with sections
- Customize writing style, tone, and formatting
- Add or remove sections as needed

### 3. Generate Content
- Visit the Content Generator page
- Add custom instructions if needed
- Click "Generate Content" to create AI-powered content
- Review clarifying questions for better results

### 4. Refine and Export
- Use the refinement feature to improve content
- View quality analysis and statistics
- Export in multiple formats (DOCX, PDF, PPTX)

## API Endpoints

### File Management
- `POST /api/upload` - Upload and process files
- `GET /api/session/<session_id>` - Get session information

### Template Management
- `GET /api/template` - Get current template
- `POST /api/template` - Create new template
- `PUT /api/template` - Update existing template

### Content Generation
- `POST /api/generate` - Generate content from template and sources
- `POST /api/refine` - Refine existing content
- `POST /api/export/<format>` - Export content in specified format

## Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key
- `FLASK_ENV`: Flask environment (development/production)
- `MAX_CONTENT_LENGTH`: Maximum file upload size in bytes

### Template Structure
Templates are JSON-based and include:
- Metadata (name, description, version)
- Structure (sections with ordering and requirements)
- Style settings (tone, writing style, formality)
- Formatting options (fonts, spacing, margins)

## File Processing

### Supported Formats
- **Documents**: PDF, DOCX, PPTX
- **Spreadsheets**: XLSX, XLS
- **Images**: PNG, JPG, JPEG
- **Audio**: MP3, WAV, M4A
- **Video**: MP4, AVI, MOV

### Processing Features
- Text extraction with page/slide references
- Image metadata extraction
- Audio transcription
- Video frame analysis
- Structured data extraction from spreadsheets

## Output Generation

### Document Formats
- **DOCX**: Full-featured Word documents with formatting
- **PDF**: Professional PDF reports with proper styling
- **PPTX**: PowerPoint presentations with slide layouts

### Quality Features
- Evidence-backed content with citations
- Professional formatting and structure
- Quality scoring and analysis
- Source traceability

## Development

### Project Structure
```
├── app.py                 # Flask application
├── services/              # Backend services
│   ├── multimodal_processor.py
│   ├── template_engine.py
│   ├── ai_service.py
│   └── output_generator.py
├── src/                   # React frontend
│   ├── components/        # React components
│   ├── context/          # State management
│   └── App.js
├── uploads/              # File upload directory
├── outputs/              # Generated files directory
└── requirements.txt      # Python dependencies
```

### Adding New File Types
1. Add processor method in `multimodal_processor.py`
2. Update supported types dictionary
3. Add file type to frontend validation

### Customizing Templates
1. Modify default template in `template_engine.py`
2. Add new section types as needed
3. Update validation rules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Roadmap

### Planned Features
- Advanced AI model integration
- Collaborative editing
- Version control for templates
- Advanced analytics and insights
- Integration with popular business tools
- Mobile application
- API rate limiting and optimization
- Advanced security features

### Brownie Points Implementation
- ✅ PPTX file ingestion and template identification
- ✅ Grounded responses with source citations
- ✅ Real-time template updates
- ✅ Multimodal source processing
- ✅ Evidence-backed content generation

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team.
