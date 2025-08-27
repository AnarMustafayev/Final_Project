import { useState, useCallback } from 'react';
import { chatService } from '../services/chatService';

export const useChatPersistence = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Create new chat
  const createChat = useCallback(async (title = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const chat = await chatService.createChat(title);
      return chat;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all chats
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const chats = await chatService.getAllChats();
      return chats;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load specific chat detail
  const loadChatDetail = useCallback(async (chatId) => {
    try {
      setLoading(true);
      setError(null);
      
      const chatDetail = await chatService.getChatDetail(chatId);
      return chatDetail;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete chat
  const deleteChat = useCallback(async (chatId) => {
    try {
      setLoading(true);
      setError(null);
      
      await chatService.deleteChat(chatId);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update chat title
  const updateChatTitle = useCallback(async (chatId, title) => {
    try {
      setLoading(true);
      setError(null);
      
      await chatService.updateChatTitle(chatId, title);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save message to chat
  const saveMessage = useCallback(async (chatId, messageText, generatedSql, visualizationData = null) => {
    try {
      setError(null);
      
      let message;
      if (visualizationData) {
        const visualization = {
          type: visualizationData.type || 'table',
          data: visualizationData.data,
          config: visualizationData.config || null
        };
        
        message = await chatService.createMessageWithVisualization(
          chatId, 
          messageText, 
          generatedSql, 
          visualization
        );
      } else {
        message = await chatService.createMessage(chatId, messageText, generatedSql);
      }
      
      return message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Create new chat with first message and data
  const createChatWithMessage = useCallback(async (messageText, generatedSql, visualizationData = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const visualization = visualizationData ? {
        type: visualizationData.type || 'table',
        data: visualizationData.data,
        config: visualizationData.config || null
      } : null;

      const result = await chatService.createChatWithMessage(
        messageText, 
        generatedSql, 
        visualization
      );
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Process query and optionally save to existing chat
  const processAndSaveQuery = useCallback(async (query, chatId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await chatService.processQuery(query, chatId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // Actions
    clearError,
    createChat,
    loadChats,
    loadChatDetail,
    deleteChat,
    updateChatTitle,
    saveMessage,
    createChatWithMessage,
    processAndSaveQuery,
  };
};