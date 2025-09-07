import os
import google.generativeai as genai
from typing import Dict, List, Any, Optional
import json
import re
from dotenv import load_dotenv
load_dotenv()
class AIService:
    """AI service using Gemini API for content generation and refinement"""
    
    def __init__(self):
        # Configure Gemini API with environment variable
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set!")
        
        genai.configure(api_key=api_key)
        
        # Try to use the latest model, fallback to older versions if needed
        try:
            # Start with gemini-1.5-flash as it's more reliable and has higher quotas
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        except Exception:
            try:
                # Fallback to gemini-1.5-pro if flash is not available
                self.model = genai.GenerativeModel('gemini-1.5-pro')
            except Exception:
                try:
                    # Try the latest 2.5 model
                    self.model = genai.GenerativeModel('gemini-2.5-flash')
                except Exception:
                    # Final fallback to the original model name
                    self.model = genai.GenerativeModel('gemini-pro')
        
        self.citation_pattern = r'\[([^\]]+)\]'
    
    def list_available_models(self) -> List[str]:
        """List available models for debugging"""
        try:
            models = genai.list_models()
            model_names = []
            for model in models:
                if 'generateContent' in model.supported_generation_methods:
                    model_names.append(model.name)
            return model_names
        except Exception as e:
            return [f"Error listing models: {str(e)}"]
    
    def get_current_model_name(self) -> str:
        """Get the name of the currently used model"""
        return self.model.model_name if hasattr(self.model, 'model_name') else 'unknown'
    
    def generate_content(self, template: Dict[str, Any], extracted_content: Dict[str, Any], 
                        custom_instructions: str = "") -> Dict[str, Any]:
        """Generate content based on template and extracted content"""
        
        # Prepare context from extracted content
        context = self._prepare_context(extracted_content)
        
        # Generate content for each section
        generated_content = {
            "metadata": {
                "generated_at": "2024-01-01T00:00:00Z",
                "template_name": template.get("metadata", {}).get("name", "Unknown"),
                "sources_used": list(extracted_content.keys())
            },
            "sections": {}
        }
        
        for section in template["structure"]["sections"]:
            section_id = section["id"]
            section_title = section["title"]
            section_instructions = section.get("instructions", "")
            content_type = section.get("content_type", "text")
            
            # Create prompt for this section
            prompt = self._create_section_prompt(
                section_title, section_instructions, context, 
                custom_instructions, content_type
            )
            
            try:
                # Generate content using Gemini
                response = self.model.generate_content(prompt)
                generated_text = response.text
                
                # Extract citations from generated text
                citations = self._extract_citations(generated_text)
                
                # Format content based on type
                formatted_content = self._format_content(generated_text, content_type)
                
                generated_content["sections"][section_id] = {
                    "title": section_title,
                    "content": formatted_content,
                    "citations": citations,
                    "word_count": len(generated_text.split()),
                    "type": content_type
                }
                
            except Exception as e:
                error_msg = str(e)
                if "404" in error_msg and "models" in error_msg:
                    error_msg = f"Model not found. Current model: {self.get_current_model_name()}. Available models: {', '.join(self.list_available_models()[:3])}"
                elif "API key" in error_msg:
                    error_msg = "Invalid or missing API key. Please check your GEMINI_API_KEY environment variable."
                
                generated_content["sections"][section_id] = {
                    "title": section_title,
                    "content": f"Error generating content: {error_msg}",
                    "citations": [],
                    "word_count": 0,
                    "type": content_type
                }
        
        return generated_content
    
    def refine_content(self, current_content: Dict[str, Any], refinement_request: str,
                      template: Dict[str, Any], extracted_content: Dict[str, Any]) -> Dict[str, Any]:
        """Refine existing content based on user request"""
        
        context = self._prepare_context(extracted_content)
        
        # Create refinement prompt
        prompt = f"""
        You are refining a consulting document. Here is the current content:
        
        {json.dumps(current_content, indent=2)}
        
        User's refinement request: {refinement_request}
        
        Available source context:
        {context}
        
        Please refine the content according to the user's request while maintaining:
        1. Professional tone and structure
        2. Evidence-backed statements with proper citations
        3. Consistency with the template structure
        4. Clear, actionable insights
        
        Return the refined content in the same JSON structure.
        """
        
        try:
            response = self.model.generate_content(prompt)
            refined_content = json.loads(response.text)
            return refined_content
        except Exception as e:
            # If JSON parsing fails, return original content with error note
            current_content["metadata"]["refinement_error"] = str(e)
            return current_content
    
    def ask_clarifying_questions(self, template: Dict[str, Any], extracted_content: Dict[str, Any]) -> List[str]:
        """Generate clarifying questions to improve content quality"""
        
        context = self._prepare_context(extracted_content)
        
        prompt = f"""
        Based on the following template and extracted content, what clarifying questions should I ask the user to improve the quality and completeness of the generated document?
        
        Template: {json.dumps(template, indent=2)}
        
        Extracted Content: {context}
        
        Generate 3-5 specific, actionable questions that would help clarify:
        1. Missing information needed for key sections
        2. Specific requirements or preferences
        3. Target audience or use case details
        4. Any ambiguities in the source material
        
        Return as a JSON array of strings.
        """
        
        try:
            response = self.model.generate_content(prompt)
            questions = json.loads(response.text)
            return questions if isinstance(questions, list) else []
        except Exception as e:
            return [f"Error generating questions: {str(e)}"]
    
    def _prepare_context(self, extracted_content: Dict[str, Any]) -> str:
        """Prepare context string from extracted content"""
        context_parts = []
        
        for filename, content_data in extracted_content.items():
            file_type = content_data.get("type", "unknown")
            content = content_data.get("content", [])
            
            context_parts.append(f"\n--- {filename} ({file_type.upper()}) ---")
            
            if file_type == "pdf":
                for page in content:
                    context_parts.append(f"Page {page['page']}: {page['text'][:500]}...")
            
            elif file_type == "pptx":
                for slide in content:
                    context_parts.append(f"Slide {slide['slide']}: {slide['title']}")
                    for text in slide['text']:
                        context_parts.append(f"  - {text[:200]}...")
            
            elif file_type == "docx":
                for para in content:
                    context_parts.append(f"Para {para['paragraph']}: {para['text'][:300]}...")
            
            elif file_type == "xlsx":
                for sheet in content:
                    context_parts.append(f"Sheet {sheet['sheet']}:")
                    for row in sheet['data'][:5]:  # First 5 rows
                        context_parts.append(f"  {row}")
            
            elif file_type == "audio":
                for item in content:
                    context_parts.append(f"Transcript: {item['text'][:500]}...")
        
        return "\n".join(context_parts)
    
    def _create_section_prompt(self, title: str, instructions: str, context: str,
                              custom_instructions: str, content_type: str) -> str:
        """Create prompt for generating a specific section"""
        
        base_prompt = f"""
        You are a professional consultant creating a {title} section for a strategic analysis document.
        
        Section Instructions: {instructions}
        
        Content Type: {content_type}
        
        Available Source Material:
        {context}
        
        Requirements:
        1. Write in a professional, analytical tone
        2. Base all statements on evidence from the source material
        3. Include proper citations in format [Source: filename, page/slide X]
        4. Make content actionable and insightful
        5. Follow the specified content type format
        
        """
        
        if custom_instructions:
            base_prompt += f"\nAdditional Instructions: {custom_instructions}\n"
        
        if content_type == "list":
            base_prompt += "\nFormat as a bulleted list with clear, actionable items."
        elif content_type == "text":
            base_prompt += "\nFormat as well-structured paragraphs with clear topic sentences."
        
        base_prompt += "\nGenerate the content now:"
        
        return base_prompt
    
    def _extract_citations(self, text: str) -> List[Dict[str, str]]:
        """Extract citations from generated text"""
        citations = []
        matches = re.findall(self.citation_pattern, text)
        
        for match in matches:
            if ":" in match:
                source, location = match.split(":", 1)
                citations.append({
                    "source": source.strip(),
                    "location": location.strip(),
                    "full_citation": match
                })
        
        return citations
    
    def _format_content(self, content: str, content_type: str) -> Any:
        """Format content based on type"""
        if content_type == "list":
            # Convert to list format
            lines = content.split('\n')
            items = []
            for line in lines:
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                    items.append(line[1:].strip())
                elif line and line[0].isdigit() and '.' in line:
                    items.append(line.split('.', 1)[1].strip())
            return items if items else [content]
        
        return content
    
    def generate_executive_summary(self, full_content: Dict[str, Any]) -> str:
        """Generate executive summary from full content"""
        
        content_summary = []
        for section_id, section in full_content.get("sections", {}).items():
            content_summary.append(f"{section['title']}: {section['content'][:200]}...")
        
        prompt = f"""
        Create a concise executive summary (max 300 words) based on this document content:
        
        {json.dumps(content_summary, indent=2)}
        
        The executive summary should:
        1. Highlight key findings and insights
        2. Present main recommendations
        3. Be suitable for C-level executives
        4. Maintain professional tone
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating executive summary: {str(e)}"
    
    def validate_content_quality(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Validate content quality and provide feedback"""
        
        validation_results = {
            "overall_score": 0,
            "issues": [],
            "suggestions": [],
            "citations_count": 0
        }
        
        total_citations = 0
        total_sections = len(content.get("sections", {}))
        
        for section_id, section in content.get("sections", {}).items():
            section_text = str(section.get("content", ""))
            citations = section.get("citations", [])
            
            total_citations += len(citations)
            
            # Check for evidence-backed statements
            if len(citations) == 0 and len(section_text) > 100:
                validation_results["issues"].append(f"Section '{section['title']}' lacks citations")
            
            # Check for actionable content
            action_words = ["recommend", "suggest", "propose", "implement", "consider", "should", "must"]
            if not any(word in section_text.lower() for word in action_words):
                validation_results["suggestions"].append(f"Section '{section['title']}' could be more actionable")
        
        validation_results["citations_count"] = total_citations
        
        # Calculate overall score
        citation_score = min(total_citations / max(total_sections, 1) * 50, 50)
        structure_score = 30 if total_sections >= 3 else 15
        quality_score = 20 if len(validation_results["issues"]) == 0 else 10
        
        validation_results["overall_score"] = citation_score + structure_score + quality_score
        
        return validation_results
