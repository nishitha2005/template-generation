import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Upload, 
  Zap, 
  Eye, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

function Dashboard() {
  const { 
    files, 
    template, 
    generatedContent, 
    isLoading, 
    error,
    addNotification 
  } = useApp();
  
  const [stats, setStats] = useState({
    totalFiles: 0,
    processedFiles: 0,
    generatedSections: 0,
    totalCitations: 0
  });

  useEffect(() => {
    // Calculate stats
    const totalFiles = files.length;
    const processedFiles = Object.keys(generatedContent?.metadata?.sources_used || {}).length;
    const generatedSections = Object.keys(generatedContent?.sections || {}).length;
    const totalCitations = Object.values(generatedContent?.sections || {})
      .reduce((acc, section) => acc + (section.citations?.length || 0), 0);

    setStats({
      totalFiles,
      processedFiles,
      generatedSections,
      totalCitations
    });
  }, [files, generatedContent]);

  const quickActions = [
    {
      title: 'Upload Files',
      description: 'Add PDFs, PPTs, Excel files, and more',
      icon: Upload,
      href: '/upload',
      color: 'bg-blue-500',
      count: files.length
    },
    {
      title: 'Edit Template',
      description: 'Customize your document structure',
      icon: FileText,
      href: '/template',
      color: 'bg-green-500',
      count: template ? Object.keys(template.structure?.sections || {}).length : 0
    },
    {
      title: 'Generate Content',
      description: 'Create AI-powered content',
      icon: Zap,
      href: '/generate',
      color: 'bg-purple-500',
      count: generatedContent ? Object.keys(generatedContent.sections || {}).length : 0
    },
    {
      title: 'View Output',
      description: 'Review and export your document',
      icon: Eye,
      href: '/output',
      color: 'bg-orange-500',
      count: generatedContent ? 1 : 0
    }
  ];

  const recentActivity = [
    {
      action: 'Files uploaded',
      details: `${stats.totalFiles} files processed`,
      time: '2 minutes ago',
      icon: Upload,
      status: 'success'
    },
    {
      action: 'Template updated',
      details: 'Added Executive Summary section',
      time: '5 minutes ago',
      icon: FileText,
      status: 'success'
    },
    {
      action: 'Content generated',
      details: `${stats.generatedSections} sections created`,
      time: '8 minutes ago',
      icon: Zap,
      status: 'success'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Files
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalFiles}
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
                    Processed Files
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.processedFiles}
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
                    {stats.generatedSections}
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
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Citations
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalCitations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="relative group bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {action.description}
                </p>
                {action.count > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-2">
                    {action.count} items
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, activityIdx) => (
                <li key={activityIdx}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivity.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <activity.icon className={`h-5 w-5 ${
                            activity.status === 'success' ? 'text-green-500' : 'text-red-500'
                          }`} />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {activity.action}
                            <span className="font-medium text-gray-900">
                              {' '}{activity.details}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

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

export default Dashboard;
