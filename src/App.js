import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import TemplateEditor from './components/TemplateEditor';
import FileUpload from './components/FileUpload';
import ContentGenerator from './components/ContentGenerator';
import OutputViewer from './components/OutputViewer';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { AppProvider } from './context/AppContext';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('status', (data) => {
      console.log('Server status:', data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header isConnected={isConnected} />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<FileUpload />} />
                <Route path="/template" element={<TemplateEditor />} />
                <Route path="/generate" element={<ContentGenerator />} />
                <Route path="/output" element={<OutputViewer />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
