import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  FileText, 
  Zap, 
  Eye, 
  Settings,
  ChevronRight
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Upload Files', href: '/upload', icon: Upload },
    { name: 'Template Editor', href: '/template', icon: FileText },
    { name: 'Generate Content', href: '/generate', icon: Zap },
    { name: 'View Output', href: '/output', icon: Eye },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-primary-500" />
                )}
              </Link>
            );
          })}
        </div>
        
       
      </nav>
    </div>
  );
}

export default Sidebar;
