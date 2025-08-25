import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, History, Trash2, MessageCircle, BarChart3, PieChart, Table as TableIcon, TrendingUp, Database, Brain, CheckCircle, AlertCircle, FileText, DollarSign, Users, Calendar, Sparkles, Zap, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

const API_BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const textareaRef = useRef(null);

  const processSteps = [
    { title: "NLP Analizi", description: "Sorğunuz təbii dil emalı ilə analiz edilir", icon: Brain },
    { title: "SQL Generasiyası", description: "AI optimal SQL sorğusu yaradır", icon: Database },
    { title: "Məlumat Çıxarışı", description: "Verilənlər bazasından məlumat alınır", icon: Search },
    { title: "Ağıllı Vizualizasiya", description: "Məlumat strukturuna görə ən uyğun qrafik seçilir", icon: BarChart3 }
  ];

  const quickPrompts = [
    { text: "Bütün cədvələri göstər və strukturunu izah et", icon: Database, category: "schema" },
    { text: "Son 30 günün məlumatlarını analiz et", icon: TrendingUp, category: "trend" },
    { text: "Ən yüksək dəyərli qeydləri tap", icon: DollarSign, category: "analysis" },
    { text: "Məlumatların ümumi statistikasını ver", icon: BarChart3, category: "summary" }
  ];

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  useEffect(() => {
    // Load available tables on component mount
    fetchAvailableTables();
  }, []);

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

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults(null);
    setCurrentStep(0);
    setHasSubmitted(true);

    const newChat = {
      id: Date.now(),
      query: prompt,
      timestamp: new Date(),
      results: null
    };

    setChatHistory(prev => [newChat, ...prev]);
    setActiveChat(newChat);

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
          query: prompt,
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

  const analyzeAndProcessData = (apiData) => {
    const { data, generated_sql, column_info, row_count } = apiData;
    
    if (!data || data.length === 0) {
      return {
        type: 'empty',
        data: [],
        generated_sql,
        message: 'Sorğunuz nəticə qaytarmadı',
        column_info,
        row_count: 0
      };
    }

    // Analyze column types and data patterns
    const columns = Object.keys(data[0]);
    const numericColumns = [];
    const dateColumns = [];
    const textColumns = [];
    const categoryColumns = [];

    // Analyze each column
    columns.forEach(col => {
      const sampleValues = data.slice(0, 10).map(row => row[col]).filter(val => val !== null && val !== undefined);
      
      if (sampleValues.length === 0) return;

      // Check if numeric
      if (sampleValues.every(val => !isNaN(val) && isFinite(val))) {
        numericColumns.push(col);
      }
      // Check if date
      else if (sampleValues.some(val => !isNaN(Date.parse(val)))) {
        dateColumns.push(col);
      }
      // Check if categorical (limited unique values)
      else if (new Set(sampleValues).size <= Math.min(10, sampleValues.length * 0.8)) {
        categoryColumns.push(col);
      }
      // Otherwise it's text
      else {
        textColumns.push(col);
      }
    });

    // Determine visualization type based on data structure
    let visualizationType = 'table';
    let chartData = data;

    // Time series detection
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      visualizationType = 'timeseries';
      chartData = data.map(row => ({
        ...row,
        date: dateColumns.length > 0 ? new Date(row[dateColumns[0]]).toLocaleDateString('az-AZ') : row[dateColumns[0]]
      }));
    }
    // Categorical comparison with numeric values
    else if (categoryColumns.length > 0 && numericColumns.length > 0 && data.length <= 20) {
      if (categoryColumns.length === 1 && data.length <= 8) {
        visualizationType = 'pie';
      } else {
        visualizationType = 'bar';
      }
      
      chartData = data.map(row => ({
        category: row[categoryColumns[0]] || 'Unknown',
        value: parseFloat(row[numericColumns[0]]) || 0,
        ...row
      }));
    }
    // Large dataset with multiple numeric columns
    else if (numericColumns.length >= 2 && data.length > 20) {
      visualizationType = 'scatter';
    }
    // Ranking/leaderboard data
    else if (data.length <= 50 && numericColumns.length > 0) {
      visualizationType = 'ranking';
      chartData = data
        .sort((a, b) => (parseFloat(b[numericColumns[0]]) || 0) - (parseFloat(a[numericColumns[0]]) || 0))
        .map((row, index) => ({ ...row, rank: index + 1 }));
    }

    // Calculate statistics
    const statistics = calculateStatistics(data, numericColumns, categoryColumns);

    return {
      type: visualizationType,
      data: chartData,
      originalData: data,
      generated_sql,
      column_info: {
        numeric: numericColumns,
        date: dateColumns,
        text: textColumns,
        category: categoryColumns,
        total: columns.length
      },
      row_count,
      statistics,
      primaryNumericColumn: numericColumns[0],
      primaryCategoryColumn: categoryColumns[0],
      primaryDateColumn: dateColumns[0]
    };
  };

  const calculateStatistics = (data, numericColumns, categoryColumns) => {
    const stats = {
      totalRows: data.length,
      numericStats: {},
      categoryStats: {}
    };

    // Calculate numeric statistics
    numericColumns.forEach(col => {
      const values = data.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
      if (values.length > 0) {
        stats.numericStats[col] = {
          sum: values.reduce((a, b) => a + b, 0),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });

    // Calculate category statistics
    categoryColumns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined);
      const counts = {};
      values.forEach(val => {
        counts[val] = (counts[val] || 0) + 1;
      });
      stats.categoryStats[col] = {
        uniqueCount: Object.keys(counts).length,
        topValues: Object.entries(counts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([value, count]) => ({ value, count }))
      };
    });

    return stats;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearHistory = () => {
    setChatHistory([]);
    setActiveChat(null);
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    setPrompt(chat.query);
    if (chat.results) {
      setResults(chat.results);
      setHasSubmitted(true);
    }
  };

  const renderStatisticsCards = () => {
    if (!results?.statistics) return null;

    const { statistics } = results;
    const cards = [];

    // Total rows card
    cards.push(
      <div key="total" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Ümumi Qeydlər</p>
            <p className="text-2xl font-bold">{statistics.totalRows.toLocaleString()}</p>
          </div>
          <FileText className="h-8 w-8 text-blue-200" />
        </div>
      </div>
    );

    // Numeric statistics cards
    Object.entries(statistics.numericStats).slice(0, 3).forEach(([column, stats], index) => {
      const colors = [
        'from-green-500 to-green-600',
        'from-purple-500 to-purple-600',
        'from-orange-500 to-orange-600'
      ];
      
      cards.push(
        <div key={column} className={`bg-gradient-to-r ${colors[index]} rounded-xl p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-80 text-sm font-medium">{column}</p>
              <p className="text-2xl font-bold">{stats.sum.toLocaleString()}</p>
              <p className="text-white text-opacity-60 text-xs">Orta: {stats.avg.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-white text-opacity-60" />
          </div>
        </div>
      );
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards}
      </div>
    );
  };

  const renderVisualization = () => {
    if (!results) return null;

    const { type, data, primaryNumericColumn, primaryCategoryColumn, primaryDateColumn } = results;

    switch (type) {
      case 'timeseries':
        return (
          <div className="space-y-6">
            {renderStatisticsCards()}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-blue-600" />
                Zaman Seriyası Analizi
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey={primaryDateColumn || "date"} 
                    stroke="#666" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey={primaryNumericColumn} 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorGradient)" 
                    strokeWidth={3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className="space-y-6">
            {renderStatisticsCards()}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Paylanma Diaqramı
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => `${entry.category}: ${entry.value.toLocaleString()}`}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Təfərrüatlı Məlumat</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: pieColors[index % pieColors.length] }}
                        ></div>
                        <span className="font-medium text-gray-900">{item.category}</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-700">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'bar':
        return (
          <div className="space-y-6">
            {renderStatisticsCards()}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Müqayisəli Analiz
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#666" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }} 
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'scatter':
        const numericCols = results.column_info.numeric;
        return (
          <div className="space-y-6">
            {renderStatisticsCards()}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Korrelyasiya Analizi
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey={numericCols[0]} 
                    stroke="#666" 
                    tick={{ fontSize: 12 }}
                    name={numericCols[0]}
                  />
                  <YAxis 
                    dataKey={numericCols[1]} 
                    stroke="#666" 
                    tick={{ fontSize: 12 }}
                    name={numericCols[1]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }} 
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter dataKey={numericCols[1]} fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'ranking':
        return (
          <div className="space-y-6">
            {renderStatisticsCards()}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Reytinq Cədvəli
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reytinq
                      </th>
                      {Object.keys(data[0] || {}).filter(key => key !== 'rank').map((key) => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.slice(0, 50).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            index < 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            #{row.rank || index + 1}
                          </div>
                        </td>
                        {Object.entries(row).filter(([key]) => key !== 'rank').map(([key, value], i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof value === 'number' 
                              ? value.toLocaleString('az-AZ', { 
                                  minimumFractionDigits: 0, 
                                  maximumFractionDigits: 2 
                                }) 
                              : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'empty':
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nəticə tapılmadı</h3>
            <p className="text-gray-600">{results.message}</p>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {renderStatisticsCards()}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-blue-600" />
                Məlumat Cədvəli
              </h3>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {Object.keys(data[0] || {}).map((key) => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof value === 'number' 
                              ? value.toLocaleString('az-AZ', { 
                                  minimumFractionDigits: 0, 
                                  maximumFractionDigits: 2 
                                }) 
                              : value?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Chat History */}
        <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Chat Tarixi
              </h2>
              <button
                onClick={clearHistory}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Tarixi təmizlə"
              >
                <Trash2 className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            {availableTables.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Mövcud cədvəllər:</p>
                <div className="flex flex-wrap gap-1">
                  {availableTables.slice(0, 5).map((table, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                      {table}
                    </span>
                  ))}
                  {availableTables.length > 5 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md">
                      +{availableTables.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Hələ heç bir chat yoxdur</p>
                <p className="text-gray-400 text-xs mt-1">İlk sorğunuzu yazın</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeChat?.id === chat.id 
                      ? 'bg-blue-50 border-blue-200 border' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <p className="text-sm text-gray-800 line-clamp-2 mb-1">{chat.query}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {chat.timestamp.toLocaleDateString('az-AZ', { 
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {chat.results && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  SQL Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Təbii dillə məlumat bazası analizi və vizualizasiya</p>
              </div>
              
              {results && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {results.row_count} qeyd tapıldı
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {/* Welcome/Results Section */}
            {!hasSubmitted ? (
              <div className="p-6">
                {/* Welcome Section */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    AI-powered SQL Analytics
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Məlumat bazanızı təbii dillə sorğulayın və ağıllı vizualizasiya ilə nəticələri analiz edin
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Tez Başlama
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickPrompts.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(item.text)}
                        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <div className="bg-gray-100 group-hover:bg-blue-100 p-2 rounded-lg transition-colors">
                          <item.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <span className="text-gray-800 group-hover:text-blue-900 font-medium">
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">NLP Analizi</h4>
                    <p className="text-gray-600 text-sm">
                      Təbii dil emalı ilə sorğularınız avtomatik olaraq SQL-ə çevrilir
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ağıllı Vizualizasiya</h4>
                    <p className="text-gray-600 text-sm">
                      Məlumat strukturuna görə ən uyğun qrafik növü avtomatik seçilir
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">İnteraktiv Analiz</h4>
                    <p className="text-gray-600 text-sm">
                      Real-time statistika və təfərrüatlı məlumat analizi
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {/* Loading Process */}
                {loading && (
                  <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                        Sorğu işlənir...
                      </h3>
                      
                      <div className="space-y-4">
                        {processSteps.map((step, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index < currentStep 
                                ? 'bg-green-100 text-green-600' 
                                : index === currentStep 
                                ? 'bg-blue-100 text-blue-600 animate-pulse' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {index < currentStep ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <step.icon className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${
                                index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {step.title}
                              </p>
                              <p className={`text-sm ${
                                index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <h4 className="font-medium text-red-900">Xəta baş verdi</h4>
                      </div>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Results Visualization */}
                {results && (
                  <div className="space-y-6">
                    {/* SQL Query Display */}
                    {results.generated_sql && (
                      <div className="bg-gray-900 rounded-xl p-6 text-white">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Yaradılan SQL Sorğusu
                        </h4>
                        <pre className="text-sm bg-gray-800 rounded-lg p-3 overflow-x-auto">
                          <code>{results.generated_sql}</code>
                        </pre>
                      </div>
                    )}

                    {/* Main Visualization */}
                    {renderVisualization()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Məlumat bazanızı haqqında sual yazın... (məsələn: 'Son ayın satış məlumatlarını göstər')"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[52px] max-h-32"
                  rows={1}
                  disabled={loading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || loading}
                  className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-500">
                  Enter ilə göndər, Shift+Enter ilə yeni sətir
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Hazır
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;