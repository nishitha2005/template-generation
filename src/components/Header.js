import React from 'react';
import { Wifi, WifiOff, Brain, FileText } from 'lucide-react';

function Header({ isConnected }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Template Engine</h1>
                <p className="text-sm text-gray-500">Powered by Gemini AI</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                 
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-500" />
                  
                </>
              )}
            </div>
            
            
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
