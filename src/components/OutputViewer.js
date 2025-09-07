import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Download, 
  Eye, 
  FileText, 
  BarChart3, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

function OutputViewer() {
  const { 
    generatedContent, 
    error,
    isLoading, 
    setLoading, 
    setError, 
    clearError, 
    addNotification 
  } = useApp();
  
  const [selectedFormat, setSelectedFormat] = useState('docx');
  const [isExporting, setIsExporting] = useState(false);
  const [contentStats, setContentStats] = useState(null);
  const [qualityScore, setQualityScore] = useState(null);

  useEffect(() => {
    if (generatedContent) {
      calculateStatsAndQuality();
    }
  }, [generatedContent]);

  const calculateStatsAndQuality = () => {
    if (!generatedContent) return;

    const sections = Object.values(generatedContent.sections || {});

    // --- Stats ---
    const totalWords = sections.reduce((acc, s) => acc + (s.word_count || 0), 0);
    const totalCitations = sections.reduce((acc, s) => acc + (s.citations?.length || 0), 0);
    const avgWordsPerSection = totalWords / Math.max(sections.length, 1);

    setContentStats({
      sections: sections.length,
      words: totalWords,
      citations: totalCitations,
      avgWordsPerSection: Math.round(avgWordsPerSection),
      sources: generatedContent.metadata?.sources_used?.length || 0
    });

    // --- Quality ---
    const citationScore = Math.min((totalCitations / Math.max(sections.length, 1)) * 50, 50);
    const structureScore = sections.length >= 3 ? 30 : 15;
    const completenessScore = sections.length >= 5 ? 20 : 10;
    const totalScore = citationScore + structureScore + completenessScore;

    setQualityScore({
      total: Math.round(totalScore),
      citationScore: Math.round(citationScore),
      structureScore,
      completenessScore,
      grade: totalScore >= 80 ? 'A' : totalScore >= 60 ? 'B' : totalScore >= 40 ? 'C' : 'D'
    });
  };

  const exportContent = async (format) => {
    try {
      setIsExporting(true);
      clearError();

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
    } finally {
      setIsExporting(false);
    }
  };

  const getQualityColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-orange-600 bg-orange-100';
      case 'D': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!generatedContent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Output Viewer</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and export your generated content
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content generated</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate content first to view and export your document.
            </p>
            <div className="mt-6">
              <a
                href="/generate"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Generator
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Output Viewer</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review, analyze, and export your generated content
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="block w-32 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="docx">DOCX</option>
            <option value="pdf">PDF</option>
            <option value="pptx">PPTX</option>
          </select>
          <button
            onClick={() => exportContent(selectedFormat)}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="spinner mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {selectedFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <FileText className="h-6 w-6 text-blue-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Sections</dt>
              <dd className="text-lg font-medium text-gray-900">{contentStats?.sections || 0}</dd>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <BarChart3 className="h-6 w-6 text-green-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Word Count</dt>
              <dd className="text-lg font-medium text-gray-900">{contentStats?.words?.toLocaleString() || 0}</dd>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <CheckCircle className="h-6 w-6 text-purple-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Citations</dt>
              <dd className="text-lg font-medium text-gray-900">{contentStats?.citations || 0}</dd>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <Eye className="h-6 w-6 text-orange-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Sources</dt>
              <dd className="text-lg font-medium text-gray-900">{contentStats?.sources || 0}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Score */}
      {qualityScore && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Content Quality Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Score</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityColor(qualityScore.total)}`}>
                    {qualityScore.total}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${qualityScore.total}%` }}
                  ></div>
                </div>
                <div className="mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${getGradeColor(qualityScore.grade)}`}>
                    Grade: {qualityScore.grade}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Citation Quality</span>
                  <span className="font-medium">{qualityScore.citationScore}/50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Structure</span>
                  <span className="font-medium">{qualityScore.structureScore}/30</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completeness</span>
                  <span className="font-medium">{qualityScore.completenessScore}/20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Preview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Content Preview</h3>
            <div className="text-sm text-gray-500">
              Generated: {new Date(generatedContent.metadata?.generated_at || Date.now()).toLocaleString()}
            </div>
          </div>
          
          <div className="prose max-w-none">
            {Object.entries(generatedContent.sections || {}).map(([sectionId, section]) => (
              <div key={sectionId} className="mb-8 border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{section.word_count || 0} words</span>
                    {section.citations && section.citations.length > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {section.citations.length} citations
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-gray-700 leading-relaxed">
                  {Array.isArray(section.content) ? (
                    <ul className="list-disc list-inside space-y-2">
                      {section.content.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  )}
                </div>
                
                {section.citations && section.citations.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Sources & Citations:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {section.citations.map((citation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          <span>{citation.full_citation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutputViewer;
