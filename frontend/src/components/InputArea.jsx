import React from 'react';
import { Send } from 'lucide-react';

const InputArea = ({ 
  prompt, 
  onPromptChange, 
  onKeyPress, 
  onSubmit, 
  loading, 
  textareaRef 
}) => {
  return (
    <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Məlumat bazanızı haqqında sual yazın... (məsələn: 'Son ayın satış məlumatlarını göstər')"
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[52px] max-h-32"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={onSubmit}
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
  );
};

export default InputArea;