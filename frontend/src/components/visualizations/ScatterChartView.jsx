import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const ScatterChartView = ({ results }) => {
  const { data, column_info } = results;
  const numericCols = column_info.numeric;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        Korrelyasiya Analizi
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={numericCols[0]} 
            stroke="#666" 
            tick={{ fontSize: 12 }}
            name={numericCols[0]}
          />
          <YAxis 
            dataKey={numericCols[1]} 
            stroke="#666" 
            tick={{ fontSize: 12 }}
            name={numericCols[1]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
            }} 
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter dataKey={numericCols[1]} fill="#3B82F6" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartView;