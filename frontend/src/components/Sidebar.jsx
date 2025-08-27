import React, { useState } from 'react';
import { History, Database, Loader } from 'lucide-react';
import NewChatButton from './NewChatButton';
import ChatListItem from './ChatListItem';
import { useChat } from '../contexts/ChatContext';

const Sidebar = ({ availableTables = [] }) => {
  const {
    chats,
    activeChat,
    loading,
    error,
    createChat,
    selectChat,
    deleteChat,
    updateChatTitle,
    clearActiveChat
  } = useChat();

  const [creatingChat, setCreatingChat] = useState(false);

  const handleCreateNewChat = async () => {
    try {
      setCreatingChat(true);
      await createChat();
      // Chat creation and selection is handled in the context
    } catch (error) {
      console.error('Yeni chat yaradılarkən xəta:', error);
    } finally {
      setCreatingChat(false);
    }
  };

  const handleStartNewChat = () => {
    // Clear active chat to start fresh
    clearActiveChat();
  };

  return (
    <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Chat Tarixi
          </h2>
        </div>

        {/* New Chat Button */}
        <div className="space-y-2">
          <NewChatButton 
            onClick={handleCreateNewChat} 
            loading={creatingChat || loading} 
          />
          
          {/* Start Fresh Button - for when user wants to start without saving to existing chat */}
          <button
            onClick={handleStartNewChat}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Yeni sorğu (saxlanmayan)
          </button>
        </div>

        {/* Available Tables */}
        {availableTables.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-gray-400" />
              <p className="text-xs text-gray-500 font-medium">Mövcud cədvəllər:</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {availableTables.slice(0, 6).map((table, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-mono"
                  title={table}
                >
                  {table.length > 12 ? `${table.substring(0, 12)}...` : table}
                </span>
              ))}
              {availableTables.length > 6 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md">
                  +{availableTables.length - 6}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {/* Error Display */}
        {error && (
          <div className="p-4 mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && chats.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-gray-500">
              <Loader className="h-5 w-5 animate-spin" />
              <span className="text-sm">Chatlər yüklənir...</span>
            </div>
          </div>
        )}

        {/* Chat List */}
        <div className="p-4 space-y-2">
          {chats.length === 0 && !loading ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Hələ heç bir chat yoxdur</p>
              <p className="text-gray-400 text-xs mt-1">İlk chat-inizi yaradın</p>
            </div>
          ) : (
            chats.map((chat) => (
              <ChatListItem
                key={chat.chat_id}
                chat={chat}
                isActive={activeChat?.chat_id === chat.chat_id}
                onSelect={selectChat}
                onDelete={deleteChat}
                onUpdateTitle={updateChatTitle}
                loading={loading && activeChat?.chat_id === chat.chat_id}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <p>Cəmi {chats.length} chat</p>
          {activeChat && (
            <p className="mt-1 font-medium text-blue-600">
              {activeChat.title}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;