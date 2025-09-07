import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  RefreshCw, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Eye,
  Download,
  Settings
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function ContentGenerator() {
  const { 
    template, 
    extractedContent, 
    generatedContent, 
    setGeneratedContent,
    isLoading, 
    setLoading, 
    error,
    setError, 
    clearError, 
    addNotification 
  } = useApp();
  
  const [customInstructions, setCustomInstructions] = useState('');
  const [refinementRequest, setRefinementRequest] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState([]);

  useEffect(() => {
    if (template && Object.keys(extractedContent).length > 0) {
      generateClarifyingQuestions();
    }
  }, [template, extractedContent]);

  const generateContent = async () => {
    if (!template) {
      setError('Please create or load a template first');
      addNotification('error', 'Template required');
      return;
    }

    if (Object.keys(extractedContent).length === 0) {
      setError('Please upload and process files first');
      addNotification('error', 'Source files required');
      return;
    }

    try {
      setLoading(true);
      clearError();

      const response = await axios.post('/api/generate', {
        session_id: 'default',
        instructions: customInstructions
      });

      setGeneratedContent(response.data.content);
      addNotification('success', 'Content generated successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to generate content';
      setError(errorMessage);
      addNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refineContent = async () => {
    if (!generatedContent) {
      setError('No content to refine. Please generate content first.');
      addNotification('error', 'No content to refine');
      return;
    }

    if (!refinementRequest.trim()) {
      setError('Please enter refinement instructions');
      addNotification('error', 'Refinement instructions required');
      return;
    }

    try {
      setIsRefining(true);
      clearError();

      const response = await axios.post('/api/refine', {
        session_id: 'default',
        request: refinementRequest
      });

      setGeneratedContent(response.data.content);
      setRefinementRequest('');
      addNotification('success', 'Content refined successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to refine content';
      setError(errorMessage);
      addNotification('error', errorMessage);
    } finally {
      setIsRefining(false);
    }
  };

  const generateClarifyingQuestions = async () => {
    try {
      // This would be implemented in the backend
      // For now, we'll show some sample questions
      setClarifyingQuestions([
        "What is the target audience for this document?",
        "Are there any specific metrics or KPIs that should be highlighted?",
        "What is the expected length of the final document?",
        "Are there any specific formatting requirements?",
        "What is the primary objective of this analysis?"
      ]);
    } catch (err) {
      console.error('Failed to generate clarifying questions:', err);
    }
  };

  const exportContent = async (format) => {
    try {
      const response = await axios.post(`/api/export/${format}`, {
        session_id: 'default'
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `generated_content.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addNotification('success', `Content exported as ${format.toUpperCase()}`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to export content';
      setError(errorMessage);
      addNotification('error', errorMessage);
    }
  };

  const getContentStats = () => {
    if (!generatedContent) return null;

    const sections = Object.values(generatedContent.sections || {});
    const totalWords = sections.reduce((acc, section) => acc + (section.word_count || 0), 0);
    const totalCitations = sections.reduce((acc, section) => acc + (section.citations?.length || 0), 0);

    return {
      sections: sections.length,
      words: totalWords,
      citations: totalCitations
    };
  };

  const stats = getContentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Generator</h1>
          {/* <p className="mt-1 text-sm text-gray-500">
            Generate AI-powered content based on your template and source files
          </p> */}
        </div>
        {generatedContent && (
          <div className="flex items-center space-x-2">
            {/* <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button> */}
            <div className="relative">
              {/* <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button> */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => exportContent('docx')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as DOCX
                  </button>
                  <button
                    onClick={() => exportContent('pdf')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => exportContent('pptx')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PPTX
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Source Files
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Object.keys(extractedContent).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Generated Sections
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.sections || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Citations
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.citations || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Custom Instructions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Custom Instructions
          </h3>
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
              Additional instructions for content generation
            </label>
            <textarea
              id="instructions"
              rows={3}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Generate Content
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create AI-powered content based on your template and source files
              </p>
            </div>
            <button
              onClick={generateContent}
              // disabled={isLoading || !template || Object.keys(extractedContent).length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </button>
          </div>
        </div>
      </div>

     
      {/* Content Preview */}
      {showPreview && generatedContent && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Content Preview
            </h3>
            <div className="prose max-w-none">
              {Object.entries(generatedContent.sections || {}).map(([sectionId, section]) => (
                <div key={sectionId} className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {section.title}
                  </h2>
                  <div className="text-gray-700">
                    {Array.isArray(section.content) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {section.content.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <ReactMarkdown>{section.content}</ReactMarkdown>
                    )}
                  </div>
                  {section.citations && section.citations.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Sources:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {section.citations.map((citation, index) => (
                          <li key={index}>• {citation.full_citation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentGenerator;
