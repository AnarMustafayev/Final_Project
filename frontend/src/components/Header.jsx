import React from 'react';
import { Brain, CheckCircle } from 'lucide-react';

const Header = ({ results }) => {
  return (
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
  );
};

export default Header;