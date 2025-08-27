// src/hooks/useDataAnalysis.js
import { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';

export const useDataAnalysis = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Get chat functions from our new context - with safe defaults
  const { 
    chats = [],
    activeChat = null,
    activeChatDetail = null,
    loading: chatLoading = false,
    processQuery: contextProcessQuery
  } = useChat() || {};

  // Check database connection and get tables
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Try to fetch tables from your API
      const response = await fetch('http://localhost:8000/api/tables');
      if (response.ok) {
        const tables = await response.json();
        setAvailableTables(tables || []);
        setIsConnected(tables && tables.length > 0);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
      console.error('Database connection failed:', err);
    }
  };

  const analyzeAndProcessData = (apiData) => {
    if (!apiData || !apiData.data) {
      return {
        type: 'empty',
        data: [],
        generated_sql: apiData?.generated_sql || '',
        message: 'Sorğunuz nəticə qaytarmadı',
        statistics: {
          totalRows: 0,
          totalColumns: 0,
          dataTypes: {}
        }
      };
    }

    const { data, generated_sql } = apiData;
    
    if (!data || data.length === 0) {
      return {
        type: 'empty',
        data: [],
        generated_sql,
        message: 'Sorğunuz nəticə qaytarmadı',
        statistics: {
          totalRows: 0,
          totalColumns: 0,
          dataTypes: {}
        }
      };
    }

    // Analyze column types and data patterns
    const columns = Object.keys(data[0] || {});
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
      visualization_type: visualizationType,
      column_info: {
        numeric: numericColumns,
        date: dateColumns,
        text: textColumns,
        category: categoryColumns,
        total: columns.length
      },
      row_count: data.length,
      statistics,
      primaryNumericColumn: numericColumns[0],
      primaryCategoryColumn: categoryColumns[0],
      primaryDateColumn: dateColumns[0]
    };
  };

  const calculateStatistics = (data, numericColumns, categoryColumns) => {
    const stats = {
      totalRows: data.length,
      totalColumns: Object.keys(data[0] || {}).length,
      dataTypes: {},
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
        stats.dataTypes[col] = 'numeric';
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
      stats.dataTypes[col] = 'categorical';
    });

    return stats;
  };

  const processQuery = async (userQuery = query) => {
    if (!userQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Use the new chat context to process query
      if (contextProcessQuery) {
        const response = await contextProcessQuery(userQuery);
        
        // Process the data using your existing analysis logic
        const processedResult = analyzeAndProcessData({
          data: response.data,
          generated_sql: response.generated_sql,
          row_count: response.data ? response.data.length : 0
        });
        
        // Set the result for your existing Dashboard component
        setResult(processedResult);
        
        // Clear the query input
        setQuery('');
      }
      
    } catch (err) {
      setError(err.message || 'Sorğu işlənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Legacy functions for backward compatibility
  const clearHistory = () => {
    console.log('clearHistory called - handled by ChatContext');
  };

  // Convert new chat format to legacy format for existing components - with safe checks
  const chatHistory = Array.isArray(chats) ? chats.map(chat => ({
    id: chat.chat_id,
    query: chat.title,
    timestamp: new Date(chat.updated_at),
    results: chat.message_count > 0
  })) : [];
  
  // Active chat in legacy format - with safe check
  const activeChatLegacy = activeChat ? {
    id: activeChat.chat_id,
    query: activeChat.title,
    timestamp: new Date(activeChat.updated_at),
    results: activeChatDetail?.messages?.length > 0
  } : null;

  const setActiveChat = (chat) => {
    console.log('setActiveChat called - handled by ChatContext');
  };

  return {
    // Database connection
    isConnected,
    availableTables,
    
    // Query processing
    query,
    setQuery,
    isLoading: isLoading || chatLoading,
    result,
    error,
    processQuery,
    clearError,
    
    // Data analysis functions
    analyzeAndProcessData,
    
    // Legacy chat support (for backward compatibility)
    chatHistory,
    activeChat: activeChatLegacy,
    setActiveChat,
    clearHistory
  };
};