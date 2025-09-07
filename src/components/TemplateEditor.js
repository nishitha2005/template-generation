import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ArrowUp, 
  ArrowDown,
  FileText,
  List,
  Type,
  Settings
} from 'lucide-react';
import axios from 'axios';

function TemplateEditor() {
  const { 
    template, 
    setTemplate, 
    isLoading, 
    setLoading, 
    setError, 
    clearError, 
    addNotification 
  } = useApp();
  
  const [localTemplate, setLocalTemplate] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    instructions: '',
    content_type: 'text',
    required: false,
    max_length: null
  });

  useEffect(() => {
    if (template) {
      setLocalTemplate(template);
    } else {
      loadDefaultTemplate();
    }
  }, [template]);

  const loadDefaultTemplate = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/template?session_id=default');
      setTemplate(response.data.template);
      setLocalTemplate(response.data.template);
    } catch (err) {
      setError('Failed to load template');
      addNotification('error', 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    try {
      setLoading(true);
      clearError();
      
      const response = await axios.put('/api/template?session_id=default', {
        template: localTemplate
      });
      
      setTemplate(localTemplate);
      addNotification('success', 'Template saved successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to save template';
      setError(errorMessage);
      addNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    if (!newSection.title.trim()) return;

    const section = {
      id: `section_${Date.now()}`,
      title: newSection.title,
      instructions: newSection.instructions,
      content_type: newSection.content_type,
      required: newSection.required,
      order: localTemplate.structure.sections.length + 1,
      max_length: newSection.max_length
    };

    setLocalTemplate(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        sections: [...prev.structure.sections, section]
      }
    }));

    setNewSection({
      title: '',
      instructions: '',
      content_type: 'text',
      required: false,
      max_length: null
    });
    setShowAddSection(false);
  };

  const updateSection = (sectionId, updates) => {
    setLocalTemplate(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        sections: prev.structure.sections.map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      }
    }));
    setEditingSection(null);
  };

  const removeSection = (sectionId) => {
    setLocalTemplate(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        sections: prev.structure.sections.filter(section => section.id !== sectionId)
      }
    }));
  };

  const moveSection = (sectionId, direction) => {
    setLocalTemplate(prev => {
      const sections = [...prev.structure.sections];
      const index = sections.findIndex(section => section.id === sectionId);
      
      if (direction === 'up' && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
      } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      }
      
      // Update order numbers
      sections.forEach((section, idx) => {
        section.order = idx + 1;
      });
      
      return {
        ...prev,
        structure: {
          ...prev.structure,
          sections
        }
      };
    });
  };

  const updateStyle = (styleUpdates) => {
    setLocalTemplate(prev => ({
      ...prev,
      style: {
        ...prev.style,
        ...styleUpdates
      }
    }));
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'list': return <List className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (!localTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Editor</h1>
          <p className="mt-1 text-sm text-gray-500">
            Customize your document structure and style
          </p>
        </div>
        <button
          onClick={saveTemplate}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      {/* Template Metadata */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Template Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template Name
              </label>
              <input
                type="text"
                value={localTemplate.metadata.name}
                onChange={(e) => setLocalTemplate(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, name: e.target.value }
                }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={localTemplate.metadata.description}
                onChange={(e) => setLocalTemplate(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, description: e.target.value }
                }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Style Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Style Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tone
              </label>
              <select
                value={localTemplate.style.tone}
                onChange={(e) => updateStyle({ tone: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Writing Style
              </label>
              <select
                value={localTemplate.style.writing_style}
                onChange={(e) => updateStyle({ writing_style: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="analytical">Analytical</option>
                <option value="narrative">Narrative</option>
                <option value="persuasive">Persuasive</option>
                <option value="expository">Expository</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Formality
              </label>
              <select
                value={localTemplate.style.formality}
                onChange={(e) => updateStyle({ formality: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="formal">Formal</option>
                <option value="semi-formal">Semi-formal</option>
                <option value="informal">Informal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Document Sections
            </h3>
            <button
              onClick={() => setShowAddSection(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Section
            </button>
          </div>

          <div className="space-y-3">
            {localTemplate.structure.sections.map((section, index) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {section.order}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getContentTypeIcon(section.content_type)}
                      <h4 className="text-sm font-medium text-gray-900">
                        {section.title}
                      </h4>
                      {/* {section.required && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                         *
                        </span>
                      )} */}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === localTemplate.structure.sections.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingSection(section.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {/* <Edit3 className="h-4 w-4" /> */}
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {section.instructions && (
                  <p className="mt-2 text-sm text-gray-500">
                    {section.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Add Section Form */}
          {showAddSection && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Section</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={newSection.title}
                    onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter section title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instructions
                  </label>
                  <textarea
                    value={newSection.instructions}
                    onChange={(e) => setNewSection(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={2}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter instructions for this section"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Content Type
                    </label>
                    <select
                      value={newSection.content_type}
                      onChange={(e) => setNewSection(prev => ({ ...prev, content_type: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="list">List</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={newSection.required}
                      onChange={(e) => setNewSection(prev => ({ ...prev, required: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                      Required section
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Length (optional)
                    </label>
                    <input
                      type="number"
                      value={newSection.max_length || ''}
                      onChange={(e) => setNewSection(prev => ({ 
                        ...prev, 
                        max_length: e.target.value ? parseInt(e.target.value) : null 
                      }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Word limit"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddSection(false)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addSection}
                    className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Add Section
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;
