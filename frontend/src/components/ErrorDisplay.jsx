import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="mb-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h4 className="font-medium text-red-900">Xəta baş verdi</h4>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;