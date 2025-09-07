from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import json
from datetime import datetime
import google.generativeai as genai
from werkzeug.utils import secure_filename
import tempfile
import shutil

from services.multimodal_processor import MultimodalProcessor
from services.template_engine import TemplateEngine
from services.output_generator import OutputGenerator
from services.ai_service import AIService

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Create necessary directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Initialize services
multimodal_processor = MultimodalProcessor()
template_engine = TemplateEngine()
output_generator = OutputGenerator()
ai_service = AIService()

# Global state for active sessions
active_sessions = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/debug/models', methods=['GET'])
def debug_models():
    """Debug endpoint to list available models"""
    try:
        available_models = ai_service.list_available_models()
        current_model = ai_service.get_current_model_name()
        return jsonify({
            "available_models": available_models,
            "current_model": current_model,
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Upload and process multimodal files"""
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files provided"}), 400
        
        files = request.files.getlist('files')
        session_id = request.form.get('session_id', 'default')
        
        if session_id not in active_sessions:
            active_sessions[session_id] = {
                'files': [],
                'template': template_engine.get_default_template(),
                'extracted_content': {},
                'generated_content': {}
            }
        
        processed_files = []
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                
                # Process the file
                content = multimodal_processor.process_file(file_path, file.filename)
                active_sessions[session_id]['files'].append({
                    'filename': filename,
                    'path': file_path,
                    'type': multimodal_processor.get_file_type(file.filename)
                })
                active_sessions[session_id]['extracted_content'][filename] = content
                
                processed_files.append({
                    'filename': filename,
                    'type': multimodal_processor.get_file_type(file.filename),
                    'content_preview': content[:500] + "..." if len(content) > 500 else content
                })
        
        return jsonify({
            "message": "Files uploaded and processed successfully",
            "files": processed_files,
            "session_id": session_id,
            "extracted_content": active_sessions[session_id]['extracted_content']
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/template', methods=['GET', 'POST', 'PUT'])
def manage_template():
    """Manage template structure and content"""
    try:
        session_id = request.args.get('session_id', 'default')
        
        if request.method == 'GET':
            template = active_sessions.get(session_id, {}).get('template', template_engine.get_default_template())
            return jsonify({"template": template})
        
        elif request.method in ['POST', 'PUT']:
            data = request.get_json()
            template = data.get('template')
            
            if session_id not in active_sessions:
                active_sessions[session_id] = {
                    'files': [],
                    'template': template_engine.get_default_template(),
                    'extracted_content': {},
                    'generated_content': {}
                }
            
            # Update template
            active_sessions[session_id]['template'] = template
            template_engine.validate_template(template)
            
            return jsonify({"message": "Template updated successfully", "template": template})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_content():
    """Generate content based on template and extracted content"""
    try:
        data = request.get_json()
        session_id = data.get('session_id', 'default')
        custom_instructions = data.get('instructions', '')
        
        if session_id not in active_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = active_sessions[session_id]
        template = session['template']
        extracted_content = session['extracted_content']
        
        # Generate content using AI service
        generated_content = ai_service.generate_content(
            template=template,
            extracted_content=extracted_content,
            custom_instructions=custom_instructions
        )
        
        session['generated_content'] = generated_content
        
        return jsonify({
            "message": "Content generated successfully",
            "content": generated_content
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/refine', methods=['POST'])
def refine_content():
    """Refine content based on conversational input"""
    try:
        data = request.get_json()
        session_id = data.get('session_id', 'default')
        refinement_request = data.get('request', '')
        
        if session_id not in active_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = active_sessions[session_id]
        
        # Use AI service to refine content
        refined_content = ai_service.refine_content(
            current_content=session.get('generated_content', {}),
            refinement_request=refinement_request,
            template=session['template'],
            extracted_content=session['extracted_content']
        )
        
        session['generated_content'] = refined_content
        
        return jsonify({
            "message": "Content refined successfully",
            "content": refined_content
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/export/<format>', methods=['POST'])
def export_content(format):
    """Export generated content in specified format"""
    try:
        data = request.get_json()
        session_id = data.get('session_id', 'default')
        
        if session_id not in active_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = active_sessions[session_id]
        generated_content = session.get('generated_content', {})
        template = session['template']
        
        if not generated_content:
            return jsonify({"error": "No content to export"}), 400
        
        # Generate output file
        output_path = output_generator.generate_output(
            content=generated_content,
            template=template,
            format=format,
            output_dir=app.config['OUTPUT_FOLDER']
        )
        
        return send_file(output_path, as_attachment=True, download_name=f"generated_content.{format}")
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get session information"""
    if session_id not in active_sessions:
        return jsonify({"error": "Session not found"}), 404
    
    session = active_sessions[session_id]
    return jsonify({
        "session_id": session_id,
        "files": [f['filename'] for f in session['files']],
        "template": session['template'],
        "has_generated_content": bool(session.get('generated_content'))
    })

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('status', {'message': 'Connected to AI Template Engine'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('template_update')
def handle_template_update(data):
    """Handle real-time template updates"""
    session_id = data.get('session_id', 'default')
    template = data.get('template')
    
    if session_id in active_sessions:
        active_sessions[session_id]['template'] = template
        emit('template_updated', {'template': template})

if __name__ == '__main__':
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Initialize Gemini API
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set!")
        print("Please set your Gemini API key in the .env file or as an environment variable.")
        exit(1)
    
    genai.configure(api_key=api_key)
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
