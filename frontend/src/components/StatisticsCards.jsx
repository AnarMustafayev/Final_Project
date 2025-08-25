import React from 'react';
import { FileText, DollarSign } from 'lucide-react';

const StatisticsCards = ({ statistics }) => {
  if (!statistics) return null;

  const cards = [];

  // Total rows card
  cards.push(
    <div key="total" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm font-medium">Ümumi Qeydlər</p>
          <p className="text-2xl font-bold">{statistics.totalRows.toLocaleString()}</p>
        </div>
        <FileText className="h-8 w-8 text-blue-200" />
      </div>
    </div>
  );

  // Numeric statistics cards
  Object.entries(statistics.numericStats).slice(0, 3).forEach(([column, stats], index) => {
    const colors = [
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600'
    ];
    
    cards.push(
      <div key={column} className={`bg-gradient-to-r ${colors[index]} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-opacity-80 text-sm font-medium">{column}</p>
            <p className="text-2xl font-bold">{stats.sum.toLocaleString()}</p>
            <p className="text-white text-opacity-60 text-xs">Orta: {stats.avg.toFixed(2)}</p>
          </div>
          <DollarSign className="h-8 w-8 text-white text-opacity-60" />
        </div>
      </div>
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards}
    </div>
  );
};
export default StatisticsCards;