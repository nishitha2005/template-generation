import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useApp } from '../context/AppContext';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Image,
  Video,
  Music,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

function FileUpload() {
  const { 
    files, 
    isLoading, 
    error, 
    setLoading, 
    setError, 
    clearError, 
    addFiles, 
    addNotification,
    setExtractedContent 
  } = useApp();
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processingStatus, setProcessingStatus] = useState({});

  const onDrop = useCallback(async (acceptedFiles) => {
    clearError();
    setLoading(true);
    
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('session_id', 'default');

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.files) {
        setUploadedFiles(prev => [...prev, ...response.data.files]);
        addFiles(response.data.files);
        addNotification('success', `Successfully uploaded ${response.data.files.length} files`);
        
        // Set extracted content if available
        if (response.data.extracted_content) {
          setExtractedContent(response.data.extracted_content);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Upload failed';
      setError(errorMessage);
      addNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError, addFiles, addNotification]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.avi', '.mov']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true
  });

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'pptx':
        return <FileText className="h-8 w-8 text-orange-500" />;
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <BarChart3 className="h-8 w-8 text-green-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <Image className="h-8 w-8 text-purple-500" />;
      case 'mp3':
      case 'wav':
        return <Music className="h-8 w-8 text-pink-500" />;
      case 'mp4':
      case 'avi':
        return <Video className="h-8 w-8 text-indigo-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'pptx': return 'bg-orange-100 text-orange-800';
      case 'docx': return 'bg-blue-100 text-blue-800';
      case 'xlsx':
      case 'xls': return 'bg-green-100 text-green-800';
      case 'png':
      case 'jpg':
      case 'jpeg': return 'bg-purple-100 text-purple-800';
      case 'mp3':
      case 'wav': return 'bg-pink-100 text-pink-800';
      case 'mp4':
      case 'avi': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your source materials for AI-powered content generation
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} disabled={isLoading} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                or click to select files
              </p>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Supports PDF, PPTX, DOCX, XLSX, images, audio, and video files
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: 100MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="spinner"></div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Processing files...
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                Please wait while we extract content from your files.
              </div>
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
                Upload Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.filename}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(file.type)}`}>
                          {file.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {file.content_preview ? 'Processed' : 'Processing...'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.content_preview ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="spinner"></div>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Type Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Supported File Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Documents</p>
                <p className="text-xs text-gray-500">PDF, DOCX, PPTX</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Spreadsheets</p>
                <p className="text-xs text-gray-500">XLSX, XLS</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Image className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Images</p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Music className="h-6 w-6 text-pink-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Audio</p>
                <p className="text-xs text-gray-500">MP3, WAV, M4A</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Video className="h-6 w-6 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Video</p>
                <p className="text-xs text-gray-500">MP4, AVI, MOV</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
