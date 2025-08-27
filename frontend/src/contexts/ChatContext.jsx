import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useChatPersistence } from '../hooks/useChatPersistence';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  // State management
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatDetail, setActiveChatDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hook for database operations
  const {
    loadChats,
    loadChatDetail,
    createChat,
    deleteChat: deleteChatFromDB,
    updateChatTitle,
    createChatWithMessage,
    processAndSaveQuery,
    clearError
  } = useChatPersistence();

  // Load all chats on mount
  useEffect(() => {
    loadAllChats();
  }, []);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load all chats from database
  const loadAllChats = useCallback(async () => {
    try {
      setLoading(true);
      const loadedChats = await loadChats();
      setChats(loadedChats);
    } catch (err) {
      setError(err.message || 'Chatlər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [loadChats]);

  // Create new chat
  const handleCreateChat = useCallback(async (title = null) => {
    try {
      setLoading(true);
      const newChat = await createChat(title);
      
      // Add to local state
      setChats(prevChats => [newChat, ...prevChats]);
      
      // Set as active chat
      setActiveChat(newChat);
      setActiveChatDetail({
        ...newChat,
        messages: []
      });
      
      return newChat;
    } catch (err) {
      setError(err.message || 'Yeni chat yaradıla bilmədi');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createChat]);

  // Select and load chat detail
  const handleSelectChat = useCallback(async (chat) => {
    if (activeChat?.chat_id === chat.chat_id) return;

    try {
      setLoading(true);
      setActiveChat(chat);
      
      const chatDetail = await loadChatDetail(chat.chat_id);
      setActiveChatDetail(chatDetail);
    } catch (err) {
      setError(err.message || 'Chat məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [activeChat, loadChatDetail]);

  // Delete chat
  const handleDeleteChat = useCallback(async (chatId) => {
    try {
      await deleteChatFromDB(chatId);
      
      // Remove from local state
      setChats(prevChats => prevChats.filter(chat => chat.chat_id !== chatId));
      
      // If deleted chat was active, clear active chat
      if (activeChat?.chat_id === chatId) {
        setActiveChat(null);
        setActiveChatDetail(null);
      }
    } catch (err) {
      setError(err.message || 'Chat silinərkən xəta baş verdi');
      throw err;
    }
  }, [activeChat, deleteChatFromDB]);

  // Update chat title
  const handleUpdateChatTitle = useCallback(async (chatId, newTitle) => {
    try {
      await updateChatTitle(chatId, newTitle);
      
      // Update local state
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.chat_id === chatId 
            ? { ...chat, title: newTitle, updated_at: new Date().toISOString() }
            : chat
        )
      );
      
      // Update active chat if it's the same one
      if (activeChat?.chat_id === chatId) {
        setActiveChat(prev => ({ ...prev, title: newTitle }));
      }
      
      // Update active chat detail if it's the same one
      if (activeChatDetail?.chat_id === chatId) {
        setActiveChatDetail(prev => ({ ...prev, title: newTitle }));
      }
    } catch (err) {
      setError(err.message || 'Chat başlığı yenilənərkən xəta baş verdi');
      throw err;
    }
  }, [activeChat, activeChatDetail, updateChatTitle]);

  // Process query with automatic chat management
  const handleProcessQuery = useCallback(async (query, results = null) => {
    try {
      setLoading(true);
      
      // If no active chat, create a new one
      if (!activeChat) {
        const newChat = await handleCreateChat();
        
        // Process query and save to new chat
        const processedResults = await processAndSaveQuery(query, newChat.chat_id);
        
        // Reload chat detail to get the saved message
        const updatedChatDetail = await loadChatDetail(newChat.chat_id);
        setActiveChatDetail(updatedChatDetail);
        
        // Update chat list (move to top and update message count)
        await loadAllChats();
        
        return processedResults;
      } else {
        // Process query and save to existing active chat
        const processedResults = await processAndSaveQuery(query, activeChat.chat_id);
        
        // Reload active chat detail to get the new message
        const updatedChatDetail = await loadChatDetail(activeChat.chat_id);
        setActiveChatDetail(updatedChatDetail);
        
        // Update chat list (move to top and update message count)
        await loadAllChats();
        
        return processedResults;
      }
    } catch (err) {
      setError(err.message || 'Sorğu işlənərkən xəta baş verdi');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeChat, handleCreateChat, processAndSaveQuery, loadChatDetail, loadAllChats]);

  // Create chat with first message (for when user submits without selecting a chat)
  const handleCreateChatWithMessage = useCallback(async (messageText, generatedSql, visualizationData) => {
    try {
      setLoading(true);
      
      const { chat, message } = await createChatWithMessage(
        messageText,
        generatedSql,
        visualizationData
      );
      
      // Add to local state
      setChats(prevChats => [chat, ...prevChats]);
      
      // Set as active chat with the message
      setActiveChat(chat);
      setActiveChatDetail({
        ...chat,
        messages: [message]
      });
      
      // Reload chat list to get updated information
      await loadAllChats();
      
      return { chat, message };
    } catch (err) {
      setError(err.message || 'Chat və mesaj yaradıla bilmədi');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createChatWithMessage, loadAllChats]);

  // Clear active chat (start fresh)
  const handleClearActiveChat = useCallback(() => {
    setActiveChat(null);
    setActiveChatDetail(null);
  }, []);

  // Clear all error states
  const handleClearError = useCallback(() => {
    setError(null);
    clearError();
  }, [clearError]);

  // Get the last message from active chat (for display purposes)
  const getLastMessage = useCallback(() => {
    if (!activeChatDetail?.messages || activeChatDetail.messages.length === 0) {
      return null;
    }
    return activeChatDetail.messages[activeChatDetail.messages.length - 1];
  }, [activeChatDetail]);

  // Check if there are any messages in active chat
  const hasMessages = useCallback(() => {
    return activeChatDetail?.messages && activeChatDetail.messages.length > 0;
  }, [activeChatDetail]);

  const contextValue = {
    // State
    chats,
    activeChat,
    activeChatDetail,
    loading,
    error,
    
    // Chat management
    createChat: handleCreateChat,
    selectChat: handleSelectChat,
    deleteChat: handleDeleteChat,
    updateChatTitle: handleUpdateChatTitle,
    clearActiveChat: handleClearActiveChat,
    
    // Message/Query processing
    processQuery: handleProcessQuery,
    createChatWithMessage: handleCreateChatWithMessage,
    
    // Utility functions
    refreshChats: loadAllChats,
    clearError: handleClearError,
    getLastMessage,
    hasMessages,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};