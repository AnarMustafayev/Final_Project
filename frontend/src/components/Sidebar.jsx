import React from 'react';
import { History, Trash2, MessageCircle } from 'lucide-react';

const Sidebar = ({ chatHistory, activeChat, onClearHistory, onSelectChat, availableTables }) => {
  return (
    <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Chat Tarixi
          </h2>
          <button
            onClick={onClearHistory}
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
              onClick={() => onSelectChat(chat)}
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
  );
};

export default Sidebar;