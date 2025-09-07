import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

const initialState = {
  sessionId: 'default',
  files: [],
  template: null,
  extractedContent: {},
  generatedContent: null,
  isLoading: false,
  error: null,
  notifications: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'ADD_FILES':
      return {
        ...state,
        files: [...state.files, ...action.payload],
        error: null
      };
    
    case 'SET_TEMPLATE':
      return {
        ...state,
        template: action.payload,
        error: null
      };
    
    case 'SET_EXTRACTED_CONTENT':
      return {
        ...state,
        extractedContent: action.payload,
        error: null
      };
    
    case 'SET_GENERATED_CONTENT':
      return {
        ...state,
        generatedContent: action.payload,
        error: null
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          type: action.payload.type,
          message: action.payload.message,
          timestamp: new Date().toISOString()
        }]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'CLEAR_SESSION':
      return {
        ...initialState,
        sessionId: state.sessionId
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load default template on app start
  useEffect(() => {
    const loadDefaultTemplate = async () => {
      try {
        const response = await axios.get('/api/template?session_id=default');
        if (response.data.template) {
          dispatch({
            type: 'SET_TEMPLATE',
            payload: response.data.template
          });
        }
      } catch (err) {
        console.error('Failed to load default template:', err);
      }
    };

    loadDefaultTemplate();
  }, []);

  const addNotification = (type, message) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type, message }
    });
  };

  const removeNotification = (id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id
    });
  };

  const setLoading = (loading) => {
    dispatch({
      type: 'SET_LOADING',
      payload: loading
    });
  };

  const setError = (error) => {
    dispatch({
      type: 'SET_ERROR',
      payload: error
    });
  };

  const clearError = () => {
    dispatch({
      type: 'CLEAR_ERROR'
    });
  };

  const addFiles = (files) => {
    dispatch({
      type: 'ADD_FILES',
      payload: files
    });
  };

  const setTemplate = (template) => {
    dispatch({
      type: 'SET_TEMPLATE',
      payload: template
    });
  };

  const setExtractedContent = (content) => {
    dispatch({
      type: 'SET_EXTRACTED_CONTENT',
      payload: content
    });
  };

  const setGeneratedContent = (content) => {
    dispatch({
      type: 'SET_GENERATED_CONTENT',
      payload: content
    });
  };

  const clearSession = () => {
    dispatch({
      type: 'CLEAR_SESSION'
    });
  };

  const value = {
    ...state,
    addNotification,
    removeNotification,
    setLoading,
    setError,
    clearError,
    addFiles,
    setTemplate,
    setExtractedContent,
    setGeneratedContent,
    clearSession
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
