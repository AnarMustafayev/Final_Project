import React, { useState, useRef, useEffect } from 'react';
import { Database, MessageSquare, BarChart3, TrendingUp, Users, Calendar, User } from 'lucide-react';

// Import components
import Sidebar from './Sidebar';
import Header from './Header';
import WelcomeSection from './WelcomeSection';
import ProcessingLoader from './ProcessingLoader';
import ErrorDisplay from './ErrorDisplay';
import StatisticsCards from './StatisticsCards';
import SqlQueryDisplay from './SqlQueryDisplay';
import InputArea from './InputArea';
import { VisualizationRenderer } from './visualizations/VisualizationRenderer';

// Import hooks
import { useDataAnalysis } from '../hooks/useDataAnalysis';

const API_BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  // State management
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [currentQuery, setCurrentQuery] = useState(''); // Store current query for display
  
  // Refs
  const textareaRef = useRef(null);
  
  // Hooks
  const { analyzeAndProcessData } = useDataAnalysis();

  // Process steps for loader
  const processSteps = [
    {
      title: 'NLP Analizi',
      description: 'Sorğunuz təbii dil emalı ilə analiz edilir',
      icon: MessageSquare
    },
    {
      title: 'SQL Generasiyası',
      description: 'AI optimal SQL sorğusu yaradır',
      icon: Database
    },
    {
      title: 'Məlumat Çıxarışı',
      description: 'Verilənlər bazasından məlumat alınır',
      icon: BarChart3
    },
    {
      title: 'Ağıllı Vizualizasiya',
      description: 'Məlumat strukturuna görə ən uyğun qrafik seçilir',
      icon: TrendingUp
    }
  ];

  // Quick prompt suggestions
  const quickPrompts = [
    { 
      text: "Bütün cədvələri göstər və strukturunu izah et", 
      icon: Database, 
      category: "schema" 
    },
    { 
      text: "Son 30 günün məlumatlarını analiz et", 
      icon: TrendingUp, 
      category: "trend" 
    },
    { 
      text: "Ən yüksək dəyərli qeydləri tap", 
      icon: Users, 
      category: "analysis" 
    },
    { 
      text: "Məlumatların ümumi statistikasını ver", 
      icon: Calendar, 
      category: "summary" 
    }
  ];

  // Load available tables on component mount
  useEffect(() => {
    fetchAvailableTables();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  // Fetch available tables from API
  const fetchAvailableTables = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tables`);
      if (response.ok) {
        const tables = await response.json();
        setAvailableTables(tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    const userQuery = prompt.trim();
    
    setLoading(true);
    setError(null);
    setResults(null);
    setCurrentStep(0);
    setHasSubmitted(true);
    setCurrentQuery(userQuery); // Store the query for display

    const newChat = {
      id: Date.now(),
      query: userQuery,
      timestamp: new Date(),
      results: null
    };

    setChatHistory(prev => [newChat, ...prev]);
    setActiveChat(newChat);

    // Clear the prompt immediately after starting submission
    setPrompt('');

    try {
      // Step 1: NLP Analysis
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: SQL Generation
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Data Extraction
      setCurrentStep(2);
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userQuery,
          analyze_structure: true // Request structure analysis for smart visualization
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Sorğu zamanı xəta baş verdi');
      }

      const data = await response.json();

      // Step 4: Smart Visualization
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Analyze data and determine best visualization
      const processedResults = analyzeAndProcessData(data);
      
      setCurrentStep(4);
      setResults(processedResults);

      // Update chat history with results
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === newChat.id 
            ? { ...chat, results: processedResults }
            : chat
        )
      );
      
    } catch (err) {
      setError(err.message);
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle key press in textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle quick prompt selection
  const handlePromptClick = (promptText) => {
    setPrompt(promptText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle chat selection
  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setPrompt(chat.query);
    setCurrentQuery(chat.query);
    if (chat.results) {
      setResults(chat.results);
      setHasSubmitted(true);
    }
    setError(null);
  };

  // Clear chat history
  const handleClearHistory = () => {
    setChatHistory([]);
    setActiveChat(null);
    setResults(null);
    setError(null);
    setHasSubmitted(false);
    setPrompt('');
    setCurrentQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          chatHistory={chatHistory}
          activeChat={activeChat}
          onClearHistory={handleClearHistory}
          onSelectChat={handleSelectChat}
          availableTables={availableTables}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <Header results={results} />

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-6">
              {/* Error Display */}
              <ErrorDisplay error={error} />

              {/* Processing Loader */}
              {loading && (
                <ProcessingLoader 
                  currentStep={currentStep} 
                  processSteps={processSteps} 
                />
              )}

              {/* Welcome Section or Results */}
              {!hasSubmitted ? (
                <WelcomeSection 
                  quickPrompts={quickPrompts} 
                  onPromptClick={handlePromptClick} 
                />
              ) : (
                <div className="space-y-6">
                  {/* User Query Display */}
                  {currentQuery && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-blue-900 font-medium mb-1">Sizin sorğunuz:</p>
                          <p className="text-blue-800">{currentQuery}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {results && !loading ? (
                    <>
                      {/* SQL Query Display */}
                      <SqlQueryDisplay sql={results.generated_sql} />

                      {/* Statistics Cards */}
                      <StatisticsCards statistics={results.statistics} />

                      {/* Main Visualization */}
                      <VisualizationRenderer results={results} />
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <InputArea
            prompt={prompt}
            onPromptChange={setPrompt}
            onKeyPress={handleKeyPress}
            onSubmit={handleSubmit}
            loading={loading}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;