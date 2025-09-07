import json
from typing import Dict, List, Any, Optional
from datetime import datetime

class TemplateEngine:
    """Dynamic template management and validation"""
    
    def __init__(self):
        self.default_template = self._create_default_template()
    
    def get_default_template(self) -> Dict[str, Any]:
        """Get the default template structure"""
        return self.default_template.copy()
    
    def _create_default_template(self) -> Dict[str, Any]:
        """Create default template structure"""
        return {
            "metadata": {
                "name": "Default Consulting Report",
                "version": "1.0",
                "created_at": datetime.now().isoformat(),
                "description": "Standard consulting report template"
            },
            "structure": {
                "sections": [
                    {
                        "id": "executive_summary",
                        "title": "Executive Summary",
                        "order": 1,
                        "required": True,
                        "content_type": "text",
                        "max_length": 500,
                        "instructions": "Provide a high-level overview of key findings and recommendations"
                    },
                    {
                        "id": "introduction",
                        "title": "Introduction",
                        "order": 2,
                        "required": True,
                        "content_type": "text",
                        "instructions": "Set the context and objectives of the analysis"
                    },
                    {
                        "id": "methodology",
                        "title": "Methodology",
                        "order": 3,
                        "required": False,
                        "content_type": "text",
                        "instructions": "Describe the approach and methods used"
                    },
                    {
                        "id": "findings",
                        "title": "Key Findings",
                        "order": 4,
                        "required": True,
                        "content_type": "list",
                        "instructions": "Present main findings with supporting evidence"
                    },
                    {
                        "id": "analysis",
                        "title": "Analysis",
                        "order": 5,
                        "required": True,
                        "content_type": "text",
                        "instructions": "Provide detailed analysis and insights"
                    },
                    {
                        "id": "recommendations",
                        "title": "Recommendations",
                        "order": 6,
                        "required": True,
                        "content_type": "list",
                        "instructions": "Present actionable recommendations"
                    },
                    {
                        "id": "conclusion",
                        "title": "Conclusion",
                        "order": 7,
                        "required": True,
                        "content_type": "text",
                        "instructions": "Summarize key points and next steps"
                    }
                ]
            },
            "style": {
                "tone": "professional",
                "writing_style": "analytical",
                "language": "en",
                "formality": "formal"
            },
            "formatting": {
                "font_family": "Arial",
                "font_size": 12,
                "line_spacing": 1.5,
                "margins": {
                    "top": 1,
                    "bottom": 1,
                    "left": 1,
                    "right": 1
                }
            },
            "output_formats": ["docx", "pdf", "pptx"],
            "citation_style": "apa"
        }
    
    def validate_template(self, template: Dict[str, Any]) -> bool:
        """Validate template structure and content"""
        required_fields = ["metadata", "structure", "style", "formatting"]
        
        for field in required_fields:
            if field not in template:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate structure
        if "sections" not in template["structure"]:
            raise ValueError("Template must have sections")
        
        sections = template["structure"]["sections"]
        if not isinstance(sections, list) or len(sections) == 0:
            raise ValueError("Template must have at least one section")
        
        # Validate each section
        section_ids = set()
        for i, section in enumerate(sections):
            if not isinstance(section, dict):
                raise ValueError(f"Section {i} must be a dictionary")
            
            required_section_fields = ["id", "title", "order"]
            for field in required_section_fields:
                if field not in section:
                    raise ValueError(f"Section {i} missing required field: {field}")
            
            if section["id"] in section_ids:
                raise ValueError(f"Duplicate section ID: {section['id']}")
            section_ids.add(section["id"])
        
        return True
    
    def add_section(self, template: Dict[str, Any], section: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new section to the template"""
        if "id" not in section:
            section["id"] = f"section_{len(template['structure']['sections']) + 1}"
        
        if "order" not in section:
            section["order"] = len(template['structure']['sections']) + 1
        
        if "required" not in section:
            section["required"] = False
        
        if "content_type" not in section:
            section["content_type"] = "text"
        
        template['structure']['sections'].append(section)
        template['structure']['sections'].sort(key=lambda x: x['order'])
        
        return template
    
    def remove_section(self, template: Dict[str, Any], section_id: str) -> Dict[str, Any]:
        """Remove a section from the template"""
        template['structure']['sections'] = [
            section for section in template['structure']['sections'] 
            if section['id'] != section_id
        ]
        return template
    
    def update_section(self, template: Dict[str, Any], section_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a specific section in the template"""
        for section in template['structure']['sections']:
            if section['id'] == section_id:
                section.update(updates)
                break
        
        return template
    
    def reorder_sections(self, template: Dict[str, Any], new_order: List[str]) -> Dict[str, Any]:
        """Reorder sections based on provided order"""
        section_dict = {section['id']: section for section in template['structure']['sections']}
        
        reordered_sections = []
        for i, section_id in enumerate(new_order):
            if section_id in section_dict:
                section_dict[section_id]['order'] = i + 1
                reordered_sections.append(section_dict[section_id])
        
        template['structure']['sections'] = reordered_sections
        return template
    
    def update_style(self, template: Dict[str, Any], style_updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update template style settings"""
        template['style'].update(style_updates)
        return template
    
    def update_formatting(self, template: Dict[str, Any], formatting_updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update template formatting settings"""
        template['formatting'].update(formatting_updates)
        return template
    
    def get_section_by_id(self, template: Dict[str, Any], section_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific section by ID"""
        for section in template['structure']['sections']:
            if section['id'] == section_id:
                return section
        return None
    
    def get_required_sections(self, template: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get all required sections"""
        return [section for section in template['structure']['sections'] if section.get('required', False)]
    
    def create_custom_template(self, name: str, description: str, sections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create a custom template from scratch"""
        template = self.get_default_template()
        template['metadata']['name'] = name
        template['metadata']['description'] = description
        template['metadata']['created_at'] = datetime.now().isoformat()
        template['structure']['sections'] = sections
        
        self.validate_template(template)
        return template
    
    def export_template(self, template: Dict[str, Any]) -> str:
        """Export template as JSON string"""
        return json.dumps(template, indent=2)
    
    def import_template(self, template_json: str) -> Dict[str, Any]:
        """Import template from JSON string"""
        template = json.loads(template_json)
        self.validate_template(template)
        return template
