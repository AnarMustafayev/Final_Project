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

// Import hooks and context
import { useDataAnalysis } from '../hooks/useDataAnalysis';
import { useChat } from '../contexts/ChatContext';

const API_BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  // Context
  const {
    activeChat,
    activeChatDetail,
    loading: chatLoading,
    error: chatError,
    processQuery,
    hasMessages
  } = useChat();

  // State management
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [availableTables, setAvailableTables] = useState([]);
  const [currentQuery, setCurrentQuery] = useState('');
  
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
      text: "Hər bir filial üzrə ümumi hesab balanslarını göstər.", 
      icon: Database, 
      category: "schema" 
    },
    { 
      text: "Son 6 ay tranzaksiyalarının sayını göstərən qrafik yarat.", 
      icon: TrendingUp, 
      category: "trend" 
    },
    { 
      text: "Ən populyar kart növləri hansılardır?", 
      icon: Users, 
      category: "analysis" 
    },
    { 
      text: "Müştərilərin peşələrinə görə bölgüsünü göstər.", 
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

  // Update results when active chat changes - FIXED to prevent infinite loop
  useEffect(() => {
    if (activeChatDetail?.messages) {
      const lastMessage = activeChatDetail.messages[activeChatDetail.messages.length - 1];
      if (lastMessage && lastMessage.visualizations?.length > 0) {
        const lastViz = lastMessage.visualizations[0];
        try {
          const reconstructedResults = {
            generated_sql: lastMessage.generated_sql,
            data: lastViz.data_json,
            visualization_type: lastViz.visualization_type,
            visualization_config: lastViz.chart_config,
            statistics: analyzeAndProcessData({
              data: lastViz.data_json,
              generated_sql: lastMessage.generated_sql
            }).statistics
          };
          setResults(reconstructedResults);
          setCurrentQuery(lastMessage.message_text);
        } catch (error) {
          console.error('Error reconstructing results:', error);
          setResults(null);
          setCurrentQuery('');
        }
      } else {
        setResults(null);
        setCurrentQuery('');
      }
    } else {
      setResults(null);
      setCurrentQuery('');
    }
  }, [activeChatDetail]); // Removed analyzeAndProcessData dependency

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
    setCurrentQuery(userQuery);

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
      
      // Use the context's processQuery method which handles chat persistence
      const data = await processQuery(userQuery);

      // Step 4: Smart Visualization
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Analyze data and determine best visualization
      const processedResults = analyzeAndProcessData(data);
      
      setCurrentStep(4);
      setResults(processedResults);
      
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

  // Determine if we should show welcome section
  const shouldShowWelcome = !hasMessages?.() && !results && !loading && !currentQuery;
  
  // Get current error (prioritize local error over chat error)
  const currentError = error || chatError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar availableTables={availableTables} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <Header results={results} />

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-6">
              {/* Error Display */}
              <ErrorDisplay error={currentError} />

              {/* Processing Loader */}
              {(loading || chatLoading) && (
                <ProcessingLoader 
                  currentStep={currentStep} 
                  processSteps={processSteps} 
                />
              )}

              {/* Welcome Section or Results */}
              {shouldShowWelcome ? (
                <WelcomeSection 
                  quickPrompts={quickPrompts} 
                  onPromptClick={handlePromptClick} 
                />
              ) : (
                <div className="space-y-6">
                  {/* Active Chat Info */}
                  {activeChat && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-blue-900 font-semibold">{activeChat.title}</h3>
                          <p className="text-blue-700 text-sm">
                            {activeChatDetail?.messages?.length || 0} mesaj
                          </p>
                        </div>
                        <div className="text-xs text-blue-600">
                          {new Date(activeChat.updated_at).toLocaleString('az-AZ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chat Messages History - Show ALL messages in chronological order */}
                  {activeChatDetail?.messages && activeChatDetail.messages.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800">Chat Mesajları:</h3>
                      
                      {activeChatDetail.messages.map((message, index) => (
                        <div key={message.message_id} className="bg-white border rounded-xl p-6 shadow-sm">
                          {/* Message Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-blue-900 font-medium">
                                  Mesaj {index + 1}:
                                </p>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.created_at).toLocaleString('az-AZ')}
                                </span>
                              </div>
                              <p className="text-gray-800 mt-1">{message.message_text}</p>
                            </div>
                          </div>
                          
                          {/* SQL Query Display */}
                          {message.generated_sql && (
                            <div className="mb-4">
                              <SqlQueryDisplay sql={message.generated_sql} />
                            </div>
                          )}
                          
                          {/* Visualizations */}
                          {message.visualizations?.length > 0 && (
                            <div className="space-y-4">
                              {message.visualizations.map((viz, vizIndex) => {
                                let reconstructedResults;
                                try {
                                  reconstructedResults = {
                                    generated_sql: message.generated_sql,
                                    data: viz.data_json,
                                    visualization_type: viz.visualization_type,
                                    visualization_config: viz.chart_config,
                                    statistics: analyzeAndProcessData({
                                      data: viz.data_json,
                                      generated_sql: message.generated_sql
                                    }).statistics
                                  };
                                } catch (error) {
                                  console.error('Error reconstructing visualization:', error);
                                  return (
                                    <div key={vizIndex} className="text-red-500 text-sm">
                                      Vizualizasiya yüklənmədi: {viz.visualization_type}
                                    </div>
                                  );
                                }
                                
                                return (
                                  <div key={vizIndex}>
                                    {/* Visualization Header */}
                                    <div className="flex items-center gap-2 mb-3">
                                      <BarChart3 className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium text-gray-700">
                                        Vizualizasiya: {viz.visualization_type}
                                      </span>
                                    </div>
                                    
                                    {/* Statistics Cards for this visualization */}
                                    <StatisticsCards statistics={reconstructedResults.statistics} />
                                    
                                    {/* Render the actual visualization */}
                                    <VisualizationRenderer results={reconstructedResults} />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
            loading={loading || chatLoading}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;