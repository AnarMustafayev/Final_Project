import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({ results }) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Nəticə tapılmadı</h3>
      <p className="text-gray-600">{results.message}</p>
    </div>
  );
};

export default EmptyState;