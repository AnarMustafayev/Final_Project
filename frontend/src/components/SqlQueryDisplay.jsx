import React from 'react';
import { Database } from 'lucide-react';

const SqlQueryDisplay = ({ sql }) => {
  if (!sql) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-6 text-white">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Database className="h-4 w-4" />
        Yaradılan SQL Sorğusu
      </h4>
      <pre className="text-sm bg-gray-800 rounded-lg p-3 overflow-x-auto">
        <code>{sql}</code>
      </pre>
    </div>
  );
};

export default SqlQueryDisplay;