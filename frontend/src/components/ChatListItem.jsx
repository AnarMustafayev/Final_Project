import React, { useState } from 'react';
import { MessageCircle, Trash2, Edit2, Check, X } from 'lucide-react';

const ChatListItem = ({ 
  chat, 
  isActive, 
  onSelect, 
  onDelete, 
  onUpdateTitle, 
  loading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditStart = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(chat.title);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(chat.title);
  };

  const handleEditSave = async () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      try {
        await onUpdateTitle(chat.chat_id, editTitle.trim());
        setIsEditing(false);
      } catch (error) {
        console.error('Başlıq yenilənərkən xəta:', error);
      }
    } else {
      handleEditCancel();
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Bu chat-i silmək istədiyinizdən əminsiniz?')) {
      setIsDeleting(true);
      try {
        await onDelete(chat.chat_id);
      } catch (error) {
        console.error('Chat silinərkən xəta:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('az-AZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('az-AZ', { 
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div
      onClick={() => !isEditing && onSelect(chat)}
      className={`
        group relative p-3 rounded-lg cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-blue-50 border-blue-200 border shadow-sm' 
          : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
        }
        ${(loading || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Chat Icon */}
        <div className={`
          flex-shrink-0 p-1.5 rounded-lg mt-0.5
          ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}
        `}>
          <MessageCircle className="h-4 w-4" />
        </div>

        {/* Chat Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onFocus={(e) => e.target.select()}
              />
              <div className="flex gap-1">
                <button
                  onClick={handleEditSave}
                  className="p-1 hover:bg-green-100 rounded text-green-600"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 group-hover:text-gray-900">
                {chat.title}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatDate(chat.updated_at)}</span>
                  {chat.message_count > 0 && (
                    <>
                      <span>•</span>
                      <span>{chat.message_count} mesaj</span>
                    </>
                  )}
                </div>
                
                {/* Action buttons - shown on hover */}
                <div className={`
                  flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity
                  ${isActive ? 'opacity-100' : ''}
                `}>
                  <button
                    onClick={handleEditStart}
                    className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                    title="Başlığı dəyiş"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors disabled:opacity-50"
                    title="Chat-i sil"
                  >
                    <Trash2 className={`h-3 w-3 ${isDeleting ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ChatListItem;